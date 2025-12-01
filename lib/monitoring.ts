import * as Sentry from "@sentry/nextjs";

export interface Alert {
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  context?: Record<string, any>;
}

export function sendAlert(alert: Alert): void {
  console.log(`[Alert ${alert.severity.toUpperCase()}] ${alert.message}`);

  if (alert.severity === "error" || alert.severity === "critical") {
    Sentry.captureMessage(alert.message, {
      level: alert.severity === "critical" ? "fatal" : "error",
      extra: alert.context,
    });
  }

  // Add other alerting integrations (Discord, Slack, PagerDuty, etc.)
}

// Usage examples:
export function alertWebSocketDown(): void {
  sendAlert({
    severity: "critical",
    message: "WebSocket connection failed after max retry attempts",
    context: {
      service: "websocket",
      action: "connection_failed",
    },
  });
}

export function alertSlowProcessing(duration: number): void {
  if (duration > 5000) {
    sendAlert({
      severity: "warning",
      message: `Event processing took ${duration}ms (threshold: 5000ms)`,
      context: {
        service: "event-processor",
        duration_ms: duration,
      },
    });
  }
}