/**
 * Alert System for BugDex
 * 
 * Monitors critical metrics and sends alerts when thresholds are exceeded:
 * - RPC usage spikes
 * - Circuit breaker state changes
 * - Rate limit violations
 * - Database errors
 * 
 * Supports multiple notification channels:
 * - Email (via Resend API)
 * - Slack webhooks
 * - Console logs (development)
 */

interface Alert {
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AlertConfig {
  email?: {
    enabled: boolean;
    to: string[];
    apiKey: string;
  };
  slack?: {
    enabled: boolean;
    webhookUrl: string;
  };
  console: {
    enabled: boolean;
  };
}

const config: AlertConfig = {
  email: {
    enabled: !!process.env.RESEND_API_KEY,
    to: (process.env.ALERT_EMAIL_TO || '').split(',').filter(Boolean),
    apiKey: process.env.RESEND_API_KEY || '',
  },
  slack: {
    enabled: !!process.env.SLACK_WEBHOOK_URL,
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  },
  console: {
    enabled: true,
  },
};

/**
 * Send an alert through configured channels
 */
export async function sendAlert(alert: Alert): Promise<void> {
  const promises: Promise<void>[] = [];

  // Console logging (always enabled in dev)
  if (config.console.enabled) {
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨',
    }[alert.severity];
    
    console.log(`${emoji} [${alert.severity.toUpperCase()}] ${alert.title}`);
    console.log(`   ${alert.message}`);
    if (alert.metadata) {
      console.log('   Metadata:', alert.metadata);
    }
  }

  // Email notifications
  if (config.email?.enabled && config.email.to.length > 0) {
    promises.push(sendEmailAlert(alert));
  }

  // Slack notifications
  if (config.slack?.enabled) {
    promises.push(sendSlackAlert(alert));
  }

  await Promise.allSettled(promises);
}

/**
 * Send email alert via Resend
 */
async function sendEmailAlert(alert: Alert): Promise<void> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.email!.apiKey}`,
      },
      body: JSON.stringify({
        from: 'BugDex Alerts <alerts@bugdex.app>',
        to: config.email!.to,
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${getSeverityColor(alert.severity)};">
              ${alert.title}
            </h2>
            <p>${alert.message}</p>
            ${alert.metadata ? `
              <h3>Details:</h3>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${JSON.stringify(alert.metadata, null, 2)}</pre>
            ` : ''}
            <p style="color: #666; font-size: 12px;">
              Timestamp: ${alert.timestamp}
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email alert:', await response.text());
    }
  } catch (error) {
    console.error('Error sending email alert:', error);
  }
}

/**
 * Send Slack alert via webhook
 */
async function sendSlackAlert(alert: Alert): Promise<void> {
  try {
    const color = {
      info: '#0066cc',
      warning: '#ff9900',
      error: '#cc0000',
      critical: '#990000',
    }[alert.severity];

    const response = await fetch(config.slack!.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attachments: [
          {
            color,
            title: alert.title,
            text: alert.message,
            fields: alert.metadata
              ? Object.entries(alert.metadata).map(([key, value]) => ({
                  title: key,
                  value: JSON.stringify(value),
                  short: true,
                }))
              : undefined,
            footer: 'BugDex Monitoring',
            ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Slack alert:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}

/**
 * Get color for severity level
 */
function getSeverityColor(severity: Alert['severity']): string {
  return {
    info: '#0066cc',
    warning: '#ff9900',
    error: '#cc0000',
    critical: '#990000',
  }[severity];
}

/**
 * Pre-defined alert templates
 */
export const AlertTemplates = {
  rpcSpike: (currentRate: number, threshold: number) => ({
    severity: 'warning' as const,
    title: 'RPC Usage Spike Detected',
    message: `RPC request rate has exceeded ${threshold} req/min. Current rate: ${currentRate} req/min.`,
    timestamp: new Date().toISOString(),
    metadata: { currentRate, threshold },
  }),

  circuitBreakerOpen: (service: string, failures: number) => ({
    severity: 'critical' as const,
    title: `Circuit Breaker OPEN: ${service}`,
    message: `The circuit breaker for ${service} has opened after ${failures} failures. Service is temporarily unavailable.`,
    timestamp: new Date().toISOString(),
    metadata: { service, failures },
  }),

  circuitBreakerClosed: (service: string) => ({
    severity: 'info' as const,
    title: `Circuit Breaker CLOSED: ${service}`,
    message: `The circuit breaker for ${service} has recovered and is now closed. Service is operational.`,
    timestamp: new Date().toISOString(),
    metadata: { service },
  }),

  rateLimitViolation: (ip: string, endpoint: string) => ({
    severity: 'warning' as const,
    title: 'Rate Limit Violation',
    message: `IP ${ip} has exceeded rate limits on endpoint ${endpoint}.`,
    timestamp: new Date().toISOString(),
    metadata: { ip, endpoint },
  }),

  databaseError: (error: string) => ({
    severity: 'error' as const,
    title: 'Database Error',
    message: `A database error occurred: ${error}`,
    timestamp: new Date().toISOString(),
    metadata: { error },
  }),
};

/**
 * Monitor and send alerts based on health status
 */
export async function monitorHealth(): Promise<void> {
  try {
    const response = await fetch('/api/admin/health');
    const data = await response.json();

    if (!data.success) {
      await sendAlert({
        severity: 'error',
        title: 'Health Check Failed',
        message: 'Failed to retrieve health status',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check circuit breaker states
    for (const [service, stats] of Object.entries(data.data.circuitBreakers)) {
      const circuitStats = stats as { state: string; failures: number };
      if (circuitStats.state === 'OPEN') {
        await sendAlert(AlertTemplates.circuitBreakerOpen(service, circuitStats.failures));
      }
    }

    // Check rate limiter stats
    const { ip, rpc } = data.data.rateLimiter;
    if (ip.activeKeys > 500) {
      await sendAlert({
        severity: 'warning',
        title: 'High Active Rate Limit Keys',
        message: `Currently tracking ${ip.activeKeys} active IP rate limits`,
        timestamp: new Date().toISOString(),
        metadata: { activeKeys: ip.activeKeys },
      });
    }
  } catch (error) {
    console.error('Error monitoring health:', error);
  }
}
