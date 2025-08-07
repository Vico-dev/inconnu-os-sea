type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private logLevel: LogLevel

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    return levels[level] >= levels[this.logLevel]
  }

  private formatLog(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`
    
    if (entry.context) {
      return `${base} ${JSON.stringify(entry.context)}`
    }
    
    return base
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    }

    const formattedLog = this.formatLog(entry)
    
    switch (level) {
      case 'debug':
        console.debug(formattedLog)
        break
      case 'info':
        console.info(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'error':
        console.error(formattedLog)
        if (error?.stack) {
          console.error(error.stack)
        }
        break
    }

    // En production, envoyer à un service de logging
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry)
    }
  }

  private sendToLoggingService(entry: LogEntry) {
    // Intégration avec Sentry ou autre service
    if (process.env.SENTRY_DSN && entry.level === 'error') {
      // Sentry.captureException(entry.error)
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, context, error)
  }

  // Logs spécifiques au business
  userAction(userId: string, action: string, details?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      userId,
      action,
      ...details
    })
  }

  apiCall(method: string, path: string, statusCode: number, duration: number) {
    this.info(`API call: ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration: `${duration}ms`
    })
  }

  databaseQuery(operation: string, table: string, duration: number) {
    this.debug(`Database query: ${operation} on ${table}`, {
      operation,
      table,
      duration: `${duration}ms`
    })
  }

  paymentEvent(event: string, amount: number, currency: string, userId: string) {
    this.info(`Payment event: ${event}`, {
      event,
      amount,
      currency,
      userId
    })
  }
}

export const logger = new Logger() 