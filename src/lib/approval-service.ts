import { db } from './db'
import { ApprovalStatus, ApprovalStepStatus } from '@prisma/client'
import { sendEmail } from './email'

export interface ApprovalWorkflow {
  campaignId: string
  submittedBy: string
  approvers: {
    stepNumber: number
    stepName: string
    approverId: string
    approverRole: string
    approverName: string
  }[]
}

export class ApprovalService {
  /**
   * Crée un workflow d'approbation pour une campagne
   */
  static async createApprovalWorkflow(workflow: ApprovalWorkflow) {
    const { campaignId, submittedBy, approvers } = workflow

    // Créer l'approbation principale
    const approval = await db.campaignApproval.create({
      data: {
        campaignId,
        submittedBy,
        totalSteps: approvers.length,
        approvals: {
          create: approvers.map(approver => ({
            stepNumber: approver.stepNumber,
            stepName: approver.stepName,
            approverId: approver.approverId,
            approverRole: approver.approverRole,
            approverName: approver.approverName,
          }))
        },
        history: {
          create: {
            action: 'SUBMITTED',
            userId: submittedBy,
            userName: 'Soumissionnaire',
            userRole: 'ACCOUNT_MANAGER',
            comments: 'Campagne soumise pour approbation'
          }
        }
      },
      include: {
        approvals: true,
        history: true
      }
    })

    // Mettre à jour le statut de la campagne
    await db.campaign.update({
      where: { id: campaignId },
      data: { status: 'PENDING_APPROVAL' }
    })

    // Notifier le premier approbateur
    await this.notifyApprover(approval.approvals[0])

    return approval
  }

  /**
   * Approuve une étape du workflow
   */
  static async approveStep(approvalId: string, stepNumber: number, approverId: string, comments?: string) {
    const approval = await db.campaignApproval.findUnique({
      where: { id: approvalId },
      include: {
        approvals: {
          orderBy: { stepNumber: 'asc' }
        },
        campaign: true
      }
    })

    if (!approval) {
      throw new Error('Approval not found')
    }

    const step = approval.approvals.find(s => s.stepNumber === stepNumber)
    if (!step) {
      throw new Error('Step not found')
    }

    if (step.approverId !== approverId) {
      throw new Error('Unauthorized approver')
    }

    // Marquer l'étape comme approuvée
    await db.campaignApprovalStep.update({
      where: { id: step.id },
      data: {
        status: ApprovalStepStatus.APPROVED,
        approvedAt: new Date(),
        comments
      }
    })

    // Ajouter à l'historique
    await db.campaignApprovalHistory.create({
      data: {
        approvalId,
        action: 'APPROVED',
        userId: approverId,
        userName: step.approverName,
        userRole: step.approverRole,
        comments: comments || 'Étape approuvée'
      }
    })

    // Vérifier si c'est la dernière étape
    const allStepsApproved = approval.approvals.every(s => s.status === ApprovalStepStatus.APPROVED)
    
    if (allStepsApproved) {
      // Workflow terminé - approuver la campagne
      await db.campaignApproval.update({
        where: { id: approvalId },
        data: { 
          status: ApprovalStatus.APPROVED,
          currentStep: approval.totalSteps
        }
      })

      await db.campaign.update({
        where: { id: approval.campaignId },
        data: { status: 'APPROVED' }
      })

      // Notifier le soumissionnaire
      await this.notifyApprovalComplete(approval)
    } else {
      // Notifier le prochain approbateur
      const nextStep = approval.approvals.find(s => s.status === ApprovalStepStatus.PENDING)
      if (nextStep) {
        await this.notifyApprover(nextStep)
      }
    }

    return approval
  }

  /**
   * Rejette une étape du workflow
   */
  static async rejectStep(approvalId: string, stepNumber: number, approverId: string, comments: string) {
    const approval = await db.campaignApproval.findUnique({
      where: { id: approvalId },
      include: {
        approvals: true,
        campaign: true
      }
    })

    if (!approval) {
      throw new Error('Approval not found')
    }

    const step = approval.approvals.find(s => s.stepNumber === stepNumber)
    if (!step || step.approverId !== approverId) {
      throw new Error('Unauthorized')
    }

    // Marquer l'étape comme rejetée
    await db.campaignApprovalStep.update({
      where: { id: step.id },
      data: {
        status: ApprovalStepStatus.REJECTED,
        rejectedAt: new Date(),
        comments
      }
    })

    // Marquer l'approbation comme rejetée
    await db.campaignApproval.update({
      where: { id: approvalId },
      data: { status: ApprovalStatus.REJECTED }
    })

    // Mettre à jour le statut de la campagne
    await db.campaign.update({
      where: { id: approval.campaignId },
      data: { status: 'DRAFT' }
    })

    // Ajouter à l'historique
    await db.campaignApprovalHistory.create({
      data: {
        approvalId,
        action: 'REJECTED',
        userId: approverId,
        userName: step.approverName,
        userRole: step.approverRole,
        comments
      }
    })

    // Notifier le rejet
    await this.notifyRejection(approval, comments)

    return approval
  }

  /**
   * Récupère l'historique complet d'une approbation
   */
  static async getApprovalHistory(approvalId: string) {
    return await db.campaignApprovalHistory.findMany({
      where: { approvalId },
      orderBy: { timestamp: 'desc' }
    })
  }

  /**
   * Récupère les approbations en attente pour un utilisateur
   */
  static async getPendingApprovals(userId: string, userRole: string) {
    return await db.campaignApproval.findMany({
      where: {
        approvals: {
          some: {
            approverId: userId,
            status: ApprovalStepStatus.PENDING
          }
        },
        status: ApprovalStatus.PENDING
      },
      include: {
        campaign: {
          include: {
            client: true
          }
        },
        approvals: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    })
  }

  /**
   * Notifie un approbateur
   */
  private static async notifyApprover(step: any) {
    // TODO: Implémenter la notification email/Slack
    console.log(`Notifying approver: ${step.approverName} for step: ${step.stepName}`)
  }

  /**
   * Notifie la completion de l'approbation
   */
  private static async notifyApprovalComplete(approval: any) {
    // TODO: Implémenter la notification
    console.log(`Campaign ${approval.campaign.name} approved!`)
  }

  /**
   * Notifie le rejet
   */
  private static async notifyRejection(approval: any, comments: string) {
    // TODO: Implémenter la notification
    console.log(`Campaign ${approval.campaign.name} rejected: ${comments}`)
  }
} 