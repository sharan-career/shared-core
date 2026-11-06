import { describe, expect, it } from 'vitest'
import { AppError, isAppError } from '../src/errors.js'

describe('AppError', () => {
  it('exposes the message for 4xx errors', () => {
    const error = new AppError(404, 'LOAN_NOT_FOUND', 'Loan was not found.')

    expect(error.isExposed).toBe(true)
    expect(error.publicMessage).toBe('Loan was not found.')
    expect(error.toResponseBody()).toEqual({
      error: { code: 'LOAN_NOT_FOUND', message: 'Loan was not found.' },
    })
  })

  it('hides the message for 5xx errors', () => {
    const error = new AppError(500, 'DB_FAILURE', 'relation "loans" does not exist')

    expect(error.isExposed).toBe(false)
    expect(error.publicMessage).toBe('An unexpected error occurred.')
    expect(error.toResponseBody()).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    })
  })

  it('keeps the original message on the error for server-side logs', () => {
    const error = new AppError(503, 'UPSTREAM_DOWN', 'storage timeout after 30s')

    expect(error.message).toBe('storage timeout after 30s')
  })

  it('keeps the cause for server-side logs', () => {
    const cause = new Error('connection reset')
    const error = new AppError(500, 'DB_FAILURE', 'Database failed.', { cause })

    expect(error.cause).toBe(cause)
  })

  it('is recognised by isAppError', () => {
    expect(isAppError(new AppError(400, 'BAD', 'bad'))).toBe(true)
    expect(isAppError(new Error('plain'))).toBe(false)
    expect(isAppError('not an error')).toBe(false)
  })
})
