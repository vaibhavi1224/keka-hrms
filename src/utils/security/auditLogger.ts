
// Security audit logging utilities
interface AuditEvent {
  action: string;
  resource: string;
  userId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export class AuditLogger {
  private static async logEvent(event: AuditEvent) {
    // In production, this would send to a secure logging service
    console.log('🔒 Security Audit Log:', {
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    // Store in Supabase audit table (could be implemented)
    // await supabase.from('audit_logs').insert(event);
  }

  static async logDataAccess(resource: string, action: string, userId?: string, details?: Record<string, any>) {
    await this.logEvent({
      action: `DATA_${action.toUpperCase()}`,
      resource,
      userId,
      details,
      timestamp: new Date(),
    });
  }

  static async logSecurityEvent(event: string, userId?: string, details?: Record<string, any>) {
    await this.logEvent({
      action: `SECURITY_${event.toUpperCase()}`,
      resource: 'SYSTEM',
      userId,
      details,
      timestamp: new Date(),
    });
  }

  static async logAuthEvent(event: string, userId?: string, details?: Record<string, any>) {
    await this.logEvent({
      action: `AUTH_${event.toUpperCase()}`,
      resource: 'AUTHENTICATION',
      userId,
      details: {
        ...details,
        // Don't log sensitive information
        ...(details?.email && { email: details.email.replace(/(.{2}).*(@.*)/, '$1***$2') }),
      },
      timestamp: new Date(),
    });
  }
}
