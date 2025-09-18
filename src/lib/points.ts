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
      // Find or create points balance for user
      let balance = await tx.pointsBalance.findUnique({
        where: { userId },
      })

      if (!balance) {
        // Create new balance for user
        balance = await tx.pointsBalance.create({
          data: {
            userId,
            currentPoints: amount,
            totalPurchased: type === 'PURCHASE' || type === 'SUBSCRIPTION' ? amount : 0,
          },
        })
      } else {
        // Update existing balance
        balance = await tx.pointsBalance.update({
          where: { userId },
          data: {
            currentPoints: { increment: amount },
            totalPurchased: type === 'PURCHASE' || type === 'SUBSCRIPTION' 
              ? { increment: amount } 
              : undefined,
          },
        })
      }

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
   * Deduct points from user's balance (prioritizing rollover points)
   */
  static async deductPoints(
    userId: string,
    amount: number,
    description?: string,
    orderId?: string
  ) {
    const transaction = await prisma.$transaction(async (tx) => {
      // Get current balance and rollover records
      const [balance, rolloverRecords] = await Promise.all([
        tx.pointsBalance.findUnique({
          where: { userId },
        }),
        tx.rolloverRecord.findMany({
          where: {
            userId,
            expiresAt: {
              gt: new Date(), // Only non-expired records
            },
          },
          orderBy: {
            expiresAt: 'asc', // Use earliest expiring first
          },
        }),
      ])

      if (!balance) {
        throw new Error('User balance not found')
      }

      // Calculate total available points (current + rollover)
      const totalRolloverPoints = rolloverRecords.reduce((sum, record) => sum + record.amount, 0)
      const totalAvailablePoints = balance.currentPoints + totalRolloverPoints

      if (totalAvailablePoints < amount) {
        throw new Error('Insufficient points')
      }

      let remainingToDeduct = amount
      let pointsToDeductFromBalance = 0
      const rolloverDeductions: { id: string; amount: number }[] = []

      // First, use rollover points (FIFO - first expiring first)
      for (const record of rolloverRecords) {
        if (remainingToDeduct <= 0) break

        const deductFromThisRecord = Math.min(remainingToDeduct, record.amount)
        rolloverDeductions.push({
          id: record.id,
          amount: deductFromThisRecord,
        })
        remainingToDeduct -= deductFromThisRecord
      }

      // Then use regular balance points
      if (remainingToDeduct > 0) {
        pointsToDeductFromBalance = remainingToDeduct
      }

      // Process rollover deductions
      for (const deduction of rolloverDeductions) {
        const record = await tx.rolloverRecord.findUnique({
          where: { id: deduction.id },
        })

        if (record && record.amount >= deduction.amount) {
          // Update or delete rollover record
          if (record.amount === deduction.amount) {
            // Delete the record completely
            await tx.rolloverRecord.delete({
              where: { id: deduction.id },
            })
          } else {
            // Reduce the amount
            await tx.rolloverRecord.update({
              where: { id: deduction.id },
              data: {
                amount: { decrement: deduction.amount },
              },
            })
          }

          // Create history entry for rollover usage
          await tx.pointsHistory.create({
            data: {
              userId,
              type: 'ROLLOVER_USED',
              amount: -deduction.amount,
              description: `Used ${deduction.amount} rollover points${description ? ` - ${description}` : ''}`,
              orderId,
            },
          })
        }
      }

      // Process regular balance deduction
      if (pointsToDeductFromBalance > 0) {
        // Update points balance
        await tx.pointsBalance.update({
          where: { userId },
          data: {
            currentPoints: { decrement: pointsToDeductFromBalance },
            totalUsed: { increment: pointsToDeductFromBalance },
          },
        })

        // Create points history entry
        await tx.pointsHistory.create({
          data: {
            userId,
            type: 'DOWNLOAD',
            amount: -pointsToDeductFromBalance, // Negative for deduction
            description: description || 'Points used for download',
            orderId,
          },
        })
      }

      // Return updated balance
      const updatedBalance = await tx.pointsBalance.findUnique({
        where: { userId },
      })

      return updatedBalance!
    })

    return transaction
  }

  /**
   * Get user's current points balance
   */
  static async getBalance(userId: string) {
    let balance = await prisma.pointsBalance.findFirst({
      where: { 
        OR: [
          { userId },
          { team: { members: { some: { userId } } } }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            name: true,
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // If no balance exists, create one
    if (!balance) {
      balance = await prisma.pointsBalance.create({
        data: {
          userId,
          currentPoints: 0,
          totalPurchased: 0,
          totalUsed: 0,
        },
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

    return balance
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
   * Get user's rollover records
   */
  static async getRolloverRecords(userId: string) {
    return await prisma.rolloverRecord.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(), // Only non-expired records
        },
      },
      orderBy: {
        expiresAt: 'asc', // Show earliest expiring first
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
