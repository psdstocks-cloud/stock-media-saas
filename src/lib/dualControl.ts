import { prisma } from '@/lib/prisma'

export type ApprovalType = 'POINTS_ADJUST' | 'ORDER_REFUND'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED'

export async function isDualControlEnabled(): Promise<boolean> {
  try {
    const flag = await prisma.systemSetting.findUnique({ where: { key: 'rbac.dualControl' } })
    return flag?.value === 'true'
  } catch {
    return false
  }
}

export async function requestApproval(params: {
  type: ApprovalType
  resourceType: string
  resourceId: string
  amount?: number
  reason?: string
  requestedById: string
}) {
  return prisma.approvalRequest.create({
    data: {
      type: params.type,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      amount: params.amount,
      reason: params.reason,
      requestedById: params.requestedById,
    }
  })
}

export async function approveRequest(params: { id: string; approvedById: string }) {
  return prisma.approvalRequest.update({
    where: { id: params.id },
    data: { status: 'APPROVED', approvedById: params.approvedById },
  })
}

export async function rejectRequest(params: { id: string; approvedById: string; reason?: string }) {
  return prisma.approvalRequest.update({
    where: { id: params.id },
    data: { status: 'REJECTED', approvedById: params.approvedById, reason: params.reason },
  })
}
