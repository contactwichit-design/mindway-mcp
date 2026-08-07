export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  service: string;
  endpoint?: string;
  details?: Record<string, unknown>;
}

export class Logger {
  private static service = "mindway-mcp";

  static info(message: string, details?: Record<string, unknown>): void {
    this.log("INFO", message, details);
  }

  static warn(message: string, details?: Record<string, unknown>): void {
    this.log("WARN", message, details);
  }

  static error(message: string, details?: Record<string, unknown>): void {
    this.log("ERROR", message, details);
  }

  private static log(level: "INFO" | "WARN" | "ERROR", message: string, details?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      details: details ? this.sanitize(details) : undefined
    };
    console.log(JSON.stringify(entry));
  }

  private static sanitize(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (/token|secret|auth|password|key|credential/i.test(key)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
