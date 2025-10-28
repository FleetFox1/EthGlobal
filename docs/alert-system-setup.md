# Alert System Configuration

## Overview

BugDex includes a comprehensive alert system that monitors critical metrics and sends notifications when issues are detected. The system supports multiple notification channels and can be configured via environment variables.

## Features

- **Real-time Monitoring**: Continuous monitoring of RPC usage, circuit breakers, and rate limiters
- **Multiple Channels**: Email (Resend), Slack webhooks, and console logging
- **Severity Levels**: Info, Warning, Error, Critical
- **Auto-recovery**: Circuit breakers automatically test service recovery
- **Dashboard Integration**: Health status displayed in admin dashboard

## Environment Variables

Add these variables to your `.env.local` file:

### Email Alerts (via Resend)

```bash
# Resend API key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Comma-separated list of email addresses to receive alerts
ALERT_EMAIL_TO=admin@yourdomain.com,devops@yourdomain.com
```

### Slack Alerts

```bash
# Slack webhook URL (create at https://api.slack.com/messaging/webhooks)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

## Alert Types

### 1. RPC Usage Spike
**Severity**: Warning  
**Trigger**: RPC request rate exceeds threshold  
**Action**: Review client-side caching, check for bot traffic

### 2. Circuit Breaker Open
**Severity**: Critical  
**Trigger**: Service has too many failures  
**Action**: Check service health, review error logs, verify API keys

### 3. Circuit Breaker Closed
**Severity**: Info  
**Trigger**: Service recovered after being open  
**Action**: None required, monitoring continues

### 4. Rate Limit Violation
**Severity**: Warning  
**Trigger**: IP exceeds rate limits  
**Action**: Review traffic patterns, consider IP blocking if abuse detected

### 5. Database Error
**Severity**: Error  
**Trigger**: Database query fails  
**Action**: Check database connection, review query logs

## Testing Alerts

### From Admin Dashboard

1. Navigate to `/admin`
2. Scroll to "System Health" section
3. Click "Send Test Alert"
4. Check configured channels (console, email, Slack)

### Via API

```bash
curl https://your-domain.vercel.app/api/admin/alerts/test
```

## Monitoring Endpoints

### Health Status
```
GET /api/admin/health
```

Returns:
```json
{
  "success": true,
  "status": "healthy",
  "data": {
    "rateLimiter": {
      "ip": {
        "totalKeys": 45,
        "activeKeys": 12
      },
      "rpc": {
        "totalKeys": 8,
        "activeKeys": 3
      }
    },
    "circuitBreakers": {
      "alchemy": {
        "failures": 0,
        "successes": 0,
        "rejections": 0,
        "lastFailureTime": null,
        "state": "CLOSED"
      },
      "contracts": {
        "failures": 0,
        "successes": 0,
        "rejections": 0,
        "lastFailureTime": null,
        "state": "CLOSED"
      }
    },
    "timestamp": "2025-10-27T10:30:00.000Z"
  }
}
```

## Circuit Breaker States

### CLOSED (Green)
- **Status**: Normal operation
- **Behavior**: All requests pass through
- **Transition**: Opens after threshold failures

### HALF_OPEN (Yellow)
- **Status**: Testing recovery
- **Behavior**: Limited requests allowed
- **Transition**: Closes after success threshold, reopens on failure

### OPEN (Red)
- **Status**: Too many failures
- **Behavior**: Requests fail fast
- **Transition**: Moves to HALF_OPEN after timeout

## Rate Limiter Configuration

### IP-based Rate Limiter
- **Window**: 60 seconds
- **Max Requests**: 100 per minute per IP
- **Applied to**: All API routes

### RPC-strict Rate Limiter
- **Window**: 60 seconds
- **Max Requests**: 20 per minute per IP
- **Applied to**: Bug submission, expensive contract calls

### Global Rate Limiter
- **Window**: 60 seconds
- **Max Requests**: 10,000 per minute total
- **Applied to**: All incoming traffic

## Circuit Breaker Configuration

### Alchemy RPC
- **Failure Threshold**: 10 failures
- **Success Threshold**: 3 successes to close
- **Timeout**: 120 seconds (2 minutes)
- **Monitoring Period**: 300 seconds (5 minutes)

### Contract Calls
- **Failure Threshold**: 5 failures
- **Success Threshold**: 2 successes to close
- **Timeout**: 60 seconds (1 minute)
- **Monitoring Period**: 120 seconds (2 minutes)

## Auto-monitoring Schedule

The health monitoring system runs automatically:
- **Admin Dashboard**: Updates every 30 seconds
- **Manual Trigger**: Via `/api/admin/alerts/test` endpoint

## Response to Alerts

### Circuit Breaker OPEN
1. Check Alchemy dashboard for rate limiting
2. Verify RPC URL is correct
3. Check fallback providers are accessible
4. Review error logs for root cause
5. Consider temporarily increasing rate limits

### High Rate Limit Keys
1. Review top requesting IPs
2. Check for bot/scraper activity
3. Consider adding IP to block list
4. Investigate if legitimate traffic spike
5. Scale rate limits if needed

### RPC Usage Spike
1. Check client-side caching effectiveness
2. Review recent code deployments
3. Monitor judge/demo traffic patterns
4. Consider upgrading Alchemy tier
5. Add request deduplication if needed

## Best Practices

1. **Set up email alerts** for critical issues during production
2. **Monitor dashboard** regularly during high-traffic events
3. **Test alerts** after configuration changes
4. **Review logs** when circuit breakers open
5. **Document incidents** for post-mortem analysis
6. **Keep thresholds** tuned to your traffic patterns
7. **Scale infrastructure** proactively during events

## Troubleshooting

### Email alerts not working
- Verify `RESEND_API_KEY` is set correctly
- Check `ALERT_EMAIL_TO` contains valid addresses
- Ensure Resend domain is verified
- Check Resend dashboard for delivery status

### Slack alerts not working
- Verify `SLACK_WEBHOOK_URL` is correct
- Test webhook URL with curl
- Check Slack channel permissions
- Review Slack app configuration

### Circuit breaker stuck OPEN
- Check if underlying service is actually down
- Review failure threshold configuration
- Manually reset via health API if needed
- Check timeout duration is appropriate

### Rate limiter too aggressive
- Adjust `MAX_REQUESTS` in rate-limiter.ts
- Consider per-endpoint rate limits
- Review legitimate traffic patterns
- Add IP whitelist for known services

## Security Considerations

1. **Environment Variables**: Never commit API keys to git
2. **Admin Endpoints**: Protect with authentication middleware
3. **Webhook URLs**: Keep Slack webhooks secret
4. **Email Addresses**: Use role-based addresses (e.g., devops@)
5. **Rate Limits**: Set conservative defaults, scale up as needed

## Future Enhancements

- [ ] PagerDuty integration for critical alerts
- [ ] Custom alert rules via admin UI
- [ ] Historical metrics and trending
- [ ] Per-endpoint rate limit customization
- [ ] Automatic scaling recommendations
- [ ] Integration with Vercel Analytics
- [ ] SMS alerts via Twilio
- [ ] Discord webhook support
