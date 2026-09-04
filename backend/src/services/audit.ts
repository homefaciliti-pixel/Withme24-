import { AuditLog } from '../models';

export interface LogAdminActionParams {
  adminId: number;
  action: string;
  entityType: string;
  entityId?: number;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Log administrative changes for strict regulatory compliance.
   */
  public static async logAction(params: LogAdminActionParams): Promise<void> {
    try {
      await AuditLog.create({
        admin_id: params.adminId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        old_value: params.oldValue ? JSON.stringify(params.oldValue) : null,
        new_value: params.newValue ? JSON.stringify(params.newValue) : null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      });
    } catch (error) {
      console.error('[AuditService] Failed to create audit log:', error);
    }
  }
}
