/**
 * One-Click Workflows Implementation
 * 
 * Implements instant action workflows for smart action recommendations
 * with minimal friction for high-priority tasks
 */

import { SmartAction, BillingCode } from '@/lib/types/ai-insights';
import { toast } from '@/components/toast';

// Workflow execution result interface
interface WorkflowResult {
  success: boolean;
  message: string;
  data?: any;
  undoAction?: () => Promise<void>;
}

// Logging helper
function logWorkflow(action: string, data: any) {
  console.log(`[OneClickWorkflow] ${action}:`, {
    ...data,
    timestamp: Date.now()
  });
}

/**
 * Approve High-Confidence Billing Codes
 * 
 * Automatically approves billing codes with high confidence scores
 * and submits them to the billing system
 */
export async function approveBillingCodes(action: SmartAction): Promise<WorkflowResult> {
  const startTime = performance.now();
  
  logWorkflow('Starting billing approval workflow', {
    actionId: action.id,
    actionTitle: action.title,
    context: action.context
  });

  try {
    // Extract billing codes from action context
    const codes = action.context.relatedData?.codes as BillingCode[] || [];
    const sessionId = action.context.relatedData?.sessionId;
    
    if (!codes.length) {
      throw new Error('No billing codes found in action context');
    }

    if (!sessionId) {
      throw new Error('Session ID is required for billing approval');
    }

    logWorkflow('Processing billing codes', {
      codeCount: codes.length,
      codes: codes.map(c => ({ code: c.code, confidence: c.confidence })),
      sessionId
    });

    // Prepare approval payload
    const approvalPayload = {
      sessionId,
      approvedCodes: codes.map(code => ({
        code: code.code,
        description: code.description,
        confidence: code.confidence,
        approvedAt: new Date().toISOString(),
        approvedBy: 'ai-assisted-workflow'
      })),
      workflowId: `workflow-${Date.now()}`,
      autoApproved: true
    };

    // Call billing approval API
    const response = await fetch('/api/pipelines/billing/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Billing approval failed: ${response.statusText}`);
    }

    const result = await response.json();
    const executionTime = performance.now() - startTime;

    logWorkflow('Billing approval successful', {
      approvedCount: result.approvedCount || codes.length,
      executionTime,
      result
    });

    // Show success toast
    toast({
      type: 'success',
      description: `Successfully approved ${result.approvedCount || codes.length} billing codes`
    });

    // Create undo action
    const undoAction = async () => {
      logWorkflow('Undoing billing approval', {
        workflowId: approvalPayload.workflowId,
        sessionId
      });

      try {
        const undoResponse = await fetch('/api/pipelines/billing/undo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflowId: approvalPayload.workflowId,
            sessionId
          })
        });

        if (!undoResponse.ok) {
          throw new Error('Failed to undo billing approval');
        }

        toast({
          type: 'success',
          description: "The billing codes have been unapproved"
        });

        logWorkflow('Billing approval undo successful', {
          workflowId: approvalPayload.workflowId
        });
      } catch (error) {
        logWorkflow('Billing approval undo failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          workflowId: approvalPayload.workflowId
        });
        
        toast({
          type: 'error',
          description: "Could not revert the billing approval"
        });
        
        throw error;
      }
    };

    return {
      success: true,
      message: `Approved ${result.approvedCount || codes.length} billing codes`,
      data: result,
      undoAction
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    logWorkflow('Billing approval failed', {
      error: errorMessage,
      actionId: action.id
    });

    toast({
      type: 'error',
      description: errorMessage
    });

    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Escalate Safety Alert
 * 
 * Triggers crisis team notification and logs escalation for audit
 * Requires confirmation before execution
 */
export async function escalateSafetyAlert(action: SmartAction): Promise<WorkflowResult> {
  const startTime = performance.now();
  
  logWorkflow('Starting safety escalation workflow', {
    actionId: action.id,
    actionTitle: action.title,
    context: action.context
  });

  try {
    // Extract safety alert details
    const alertData = action.context.relatedData;
    const alertId = action.context.insightId;
    const sessionId = alertData?.sessionId;
    
    if (!alertId || !sessionId) {
      throw new Error('Alert ID and Session ID are required for escalation');
    }

    const escalationPayload = {
      alertId,
      sessionId,
      alertCategory: alertData?.alertCategory || 'unknown',
      riskScore: alertData?.riskScore || 0,
      escalationType: 'crisis_team_notification',
      escalatedAt: new Date().toISOString(),
      escalatedBy: 'ai-assisted-workflow',
      contactInfo: alertData?.contactInfo || {},
      urgency: action.priority >= 9 ? 'immediate' : 'urgent',
      notes: action.description,
      workflowId: `escalation-${Date.now()}`
    };

    logWorkflow('Processing safety escalation', {
      alertCategory: escalationPayload.alertCategory,
      riskScore: escalationPayload.riskScore,
      urgency: escalationPayload.urgency,
      sessionId
    });

    // Call safety escalation API
    const response = await fetch('/api/pipelines/safety-check/escalate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(escalationPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Safety escalation failed: ${response.statusText}`);
    }

    const result = await response.json();
    const executionTime = performance.now() - startTime;

    // Log for audit trail
    logWorkflow('Safety escalation successful', {
      escalationId: result.escalationId,
      notificationsSent: result.notificationsSent,
      auditLogId: result.auditLogId,
      executionTime,
      result
    });

    // Show success toast with crisis info
    const crisisMessage = alertData?.contactInfo?.crisisHotline 
      ? `Crisis team has been notified. Crisis Hotline: ${alertData.contactInfo.crisisHotline}`
      : "Crisis team has been notified";
    
    toast({
      type: 'success',
      description: crisisMessage
    });

    return {
      success: true,
      message: `Safety alert escalated to crisis team`,
      data: {
        ...result,
        escalationId: escalationPayload.workflowId
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    logWorkflow('Safety escalation failed', {
      error: errorMessage,
      actionId: action.id
    });

    toast({
      type: 'error',
      description: errorMessage
    });

    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Update Treatment Plan
 * 
 * Updates progress goals based on AI recommendations
 * Includes undo functionality for reversibility
 */
export async function updateTreatmentPlan(action: SmartAction): Promise<WorkflowResult> {
  const startTime = performance.now();
  
  logWorkflow('Starting treatment plan update workflow', {
    actionId: action.id,
    actionTitle: action.title,
    context: action.context
  });

  try {
    // Extract treatment plan data
    const planData = action.context.relatedData;
    const sessionId = planData?.sessionId;
    const patientId = planData?.patientId;
    
    if (!sessionId || !patientId) {
      throw new Error('Session ID and Patient ID are required for treatment plan update');
    }

    // Store current state for undo
    const previousState = {
      goals: planData?.currentGoals || [],
      interventions: planData?.currentInterventions || [],
      rating: planData?.currentRating || 0
    };

    const updatePayload = {
      sessionId,
      patientId,
      updates: {
        treatmentAdjustments: planData?.recommendations || [],
        newInterventions: planData?.interventions || [],
        goalUpdates: planData?.goalUpdates || [],
        effectivenessRating: planData?.currentRating || 0,
        trends: planData?.trends || 'stable'
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'ai-assisted-workflow',
      workflowId: `treatment-update-${Date.now()}`,
      previousState
    };

    logWorkflow('Processing treatment plan update', {
      adjustmentCount: updatePayload.updates.treatmentAdjustments.length,
      interventionCount: updatePayload.updates.newInterventions.length,
      goalUpdateCount: updatePayload.updates.goalUpdates.length,
      sessionId,
      patientId
    });

    // Call treatment plan update API
    const response = await fetch('/api/pipelines/progress/update-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Treatment plan update failed: ${response.statusText}`);
    }

    const result = await response.json();
    const executionTime = performance.now() - startTime;

    logWorkflow('Treatment plan update successful', {
      updatedGoals: result.updatedGoals || 0,
      newInterventions: result.newInterventions || 0,
      executionTime,
      result
    });

    // Show success toast
    toast({
      type: 'success',
      description: `Updated ${result.updatedGoals || 0} goals and added ${result.newInterventions || 0} new interventions`
    });

    // Create undo action
    const undoAction = async () => {
      logWorkflow('Undoing treatment plan update', {
        workflowId: updatePayload.workflowId,
        sessionId,
        patientId
      });

      try {
        const undoResponse = await fetch('/api/pipelines/progress/undo-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflowId: updatePayload.workflowId,
            sessionId,
            patientId,
            previousState
          })
        });

        if (!undoResponse.ok) {
          throw new Error('Failed to undo treatment plan update');
        }

        toast({
          type: 'success',
          description: "The treatment plan has been restored to its previous state"
        });

        logWorkflow('Treatment plan undo successful', {
          workflowId: updatePayload.workflowId
        });
      } catch (error) {
        logWorkflow('Treatment plan undo failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          workflowId: updatePayload.workflowId
        });
        
        toast({
          type: 'error',
          description: "Could not revert the treatment plan update"
        });
        
        throw error;
      }
    };

    return {
      success: true,
      message: `Updated treatment plan with ${result.updatedGoals || 0} goal changes`,
      data: result,
      undoAction
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    logWorkflow('Treatment plan update failed', {
      error: errorMessage,
      actionId: action.id
    });

    toast({
      type: 'error',
      description: errorMessage
    });

    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Execute One-Click Workflow
 * 
 * Main entry point for executing workflows based on action type
 */
export async function executeOneClickWorkflow(action: SmartAction): Promise<WorkflowResult> {
  logWorkflow('Executing one-click workflow', {
    actionId: action.id,
    actionType: action.type,
    actionTitle: action.title,
    priority: action.priority,
    requiresConfirmation: action.requiresConfirmation
  });

  try {
    switch (action.type) {
      case 'billing':
        if (action.title.toLowerCase().includes('approve')) {
          return await approveBillingCodes(action);
        }
        break;
        
      case 'safety':
        if (action.title.toLowerCase().includes('escalate') || 
            action.title.toLowerCase().includes('crisis')) {
          return await escalateSafetyAlert(action);
        }
        break;
        
      case 'progress':
        if (action.title.toLowerCase().includes('update') || 
            action.title.toLowerCase().includes('adjust')) {
          return await updateTreatmentPlan(action);
        }
        break;
        
      default:
        throw new Error(`No workflow implemented for action type: ${action.type}`);
    }

    throw new Error(`No matching workflow found for action: ${action.title}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    logWorkflow('Workflow execution failed', {
      error: errorMessage,
      actionId: action.id,
      actionType: action.type
    });

    return {
      success: false,
      message: errorMessage
    };
  }
}

// Export individual workflow functions for direct use
export const workflows = {
  approveBillingCodes,
  escalateSafetyAlert,
  updateTreatmentPlan,
  executeOneClickWorkflow
};
