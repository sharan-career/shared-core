export interface AppErrorOptions {
  readonly cause?: unknown
}

/**
 * An error that carries an HTTP status and a stable code.
 *
 * Only errors with a 4xx status expose their message to clients. Anything else
 * returns a generic message, so internal details (such as database error text)
 * never reach the client. The original message stays on the error for logs.
 */
export class AppError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(statusCode: number, code: string, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
  }

  /** Whether the message may be shown to the client. */
  get isExposed(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500
  }

  /** The client-safe message. */
  get publicMessage(): string {
    return this.isExposed ? this.message : 'An unexpected error occurred.'
  }

  /** The response body to send to the client. */
  toResponseBody(): { error: { code: string; message: string } } {
    return {
      error: {
        code: this.isExposed ? this.code : 'INTERNAL_ERROR',
        message: this.publicMessage,
      },
    }
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError
}
