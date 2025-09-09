import { prisma } from './prisma'

export class PointsManager {
  /**
   * Add points to user's balance
   */
  static async addPoints(
    userId: string,
    amount: number,
    type: 'SUBSCRIPTION' | 'PURCHASE' | 'ROLLOVER' | 'DOWNLOAD' | 'REFUND' | 'BONUS' | 'ADMIN_ADJUSTMENT',
    description?: string,
    orderId?: string
  ) {
    const transaction = await prisma.$transaction(async (tx) => {
      // Update points balance
      const balance = await tx.pointsBalance.upsert({
        where: { userId },
        update: {
          currentPoints: { increment: amount },
          totalPurchased: type === 'PURCHASE' || type === 'SUBSCRIPTION' 
            ? { increment: amount } 
            : undefined,
        },
        create: {
          userId,
          currentPoints: amount,
          totalPurchased: type === 'PURCHASE' || type === 'SUBSCRIPTION' ? amount : 0,
        },
      })

      // Create points history entry
      await tx.pointsHistory.create({
        data: {
          userId,
          type,
          amount,
          description,
          orderId,
        },
      })

      return balance
    })

    return transaction
  }

  /**
   * Deduct points from user's balance
   */
  static async deductPoints(
    userId: string,
    amount: number,
    description?: string,
    orderId?: string
  ) {
    const transaction = await prisma.$transaction(async (tx) => {
      // Check if user has enough points
      const balance = await tx.pointsBalance.findUnique({
        where: { userId },
      })

      if (!balance || balance.currentPoints < amount) {
        throw new Error('Insufficient points')
      }

      // Update points balance
      const updatedBalance = await tx.pointsBalance.update({
        where: { userId },
        data: {
          currentPoints: { decrement: amount },
          totalUsed: { increment: amount },
        },
      })

      // Create points history entry
      await tx.pointsHistory.create({
        data: {
          userId,
          type: 'DOWNLOAD',
          amount: -amount, // Negative for deduction
          description,
          orderId,
        },
      })

      return updatedBalance
    })

    return transaction
  }

  /**
   * Get user's current points balance
   */
  static async getBalance(userId: string) {
    return await prisma.pointsBalance.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
  }

  /**
   * Get user's points history
   */
  static async getHistory(userId: string, limit = 50) {
    return await prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    })
  }

  /**
   * Process subscription renewal with rollover
   */
  static async processSubscriptionRenewal(
    userId: string,
    planId: string,
    newPoints: number
  ) {
    const transaction = await prisma.$transaction(async (tx) => {
      // Get current balance and plan
      const [balance, plan] = await Promise.all([
        tx.pointsBalance.findUnique({ where: { userId } }),
        tx.subscriptionPlan.findUnique({ where: { id: planId } }),
      ])

      if (!balance || !plan) {
        throw new Error('Balance or plan not found')
      }

      // Calculate rollover amount (limited by rollover limit)
      const maxRollover = Math.floor((plan.points * plan.rolloverLimit) / 100)
      const rolloverAmount = Math.min(balance.currentPoints, maxRollover)
      const newTotalPoints = newPoints + rolloverAmount

      // Update points balance
      const updatedBalance = await tx.pointsBalance.update({
        where: { userId },
        data: {
          currentPoints: newTotalPoints,
          totalPurchased: { increment: newPoints },
          lastRollover: new Date(),
        },
      })

      // Create history entries
      if (rolloverAmount > 0) {
        await tx.pointsHistory.create({
          data: {
            userId,
            type: 'ROLLOVER',
            amount: rolloverAmount,
            description: `Rolled over ${rolloverAmount} points from previous period`,
          },
        })
      }

      await tx.pointsHistory.create({
        data: {
          userId,
          type: 'SUBSCRIPTION',
          amount: newPoints,
          description: `Monthly subscription points for ${plan.name} plan`,
        },
      })

      return updatedBalance
    })

    return transaction
  }

  /**
   * Refund points for failed/canceled orders
   */
  static async refundPoints(
    userId: string,
    orderId: string,
    amount: number,
    reason: string
  ) {
    const transaction = await prisma.$transaction(async (tx) => {
      // Add points back to balance
      const balance = await tx.pointsBalance.update({
        where: { userId },
        data: {
          currentPoints: { increment: amount },
        },
      })

      // Create refund history entry
      await tx.pointsHistory.create({
        data: {
          userId,
          type: 'REFUND',
          amount,
          description: `Refund for order ${orderId}: ${reason}`,
          orderId,
        },
      })

      return balance
    })

    return transaction
  }

  /**
   * Get points statistics for admin dashboard
   */
  static async getStats() {
    const [
      totalUsers,
      totalPointsInCirculation,
      totalPointsUsed,
      recentTransactions,
    ] = await Promise.all([
      prisma.pointsBalance.count(),
      prisma.pointsBalance.aggregate({
        _sum: { currentPoints: true },
      }),
      prisma.pointsBalance.aggregate({
        _sum: { totalUsed: true },
      }),
      prisma.pointsHistory.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ])

    return {
      totalUsers,
      totalPointsInCirculation: totalPointsInCirculation._sum.currentPoints || 0,
      totalPointsUsed: totalPointsUsed._sum.totalUsed || 0,
      recentTransactions,
    }
  }
}
