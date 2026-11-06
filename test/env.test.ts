import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { EnvValidationError, parseEnv } from '../src/env.js'

const schema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().int().positive().default(3000),
  API_TOKEN: z.string().min(1),
})

describe('parseEnv', () => {
  it('returns typed values, coercing and applying defaults', () => {
    const env = parseEnv(schema, {
      DATABASE_URL: 'https://db.example.com',
      API_TOKEN: 'token-value',
    })

    expect(env).toEqual({
      DATABASE_URL: 'https://db.example.com',
      PORT: 3000,
      API_TOKEN: 'token-value',
    })
  })

  it('coerces a numeric string', () => {
    const env = parseEnv(schema, {
      DATABASE_URL: 'https://db.example.com',
      PORT: '8080',
      API_TOKEN: 'token-value',
    })

    expect(env.PORT).toBe(8080)
  })

  it('names each failing variable', () => {
    let caught: unknown
    try {
      parseEnv(schema, { DATABASE_URL: 'not a url', PORT: '0' })
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(EnvValidationError)
    const issues = (caught as EnvValidationError).issues
    expect(issues.some((issue) => issue.startsWith('DATABASE_URL:'))).toBe(true)
    expect(issues.some((issue) => issue.startsWith('PORT:'))).toBe(true)
    expect(issues.some((issue) => issue.startsWith('API_TOKEN:'))).toBe(true)
  })

  it('never includes a submitted value in the error message', () => {
    const secret = 'super-secret-value-do-not-log'
    let caught: unknown
    try {
      parseEnv(schema, { DATABASE_URL: secret, API_TOKEN: '' })
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(EnvValidationError)
    expect((caught as Error).message).not.toContain(secret)
    expect((caught as EnvValidationError).issues.join(' ')).not.toContain(secret)
  })

  it('reads process.env when no source is given', () => {
    const original = process.env.SHARED_CORE_TEST_TOKEN
    process.env.SHARED_CORE_TEST_TOKEN = 'from-process-env'
    try {
      const env = parseEnv(z.object({ SHARED_CORE_TEST_TOKEN: z.string() }))
      expect(env.SHARED_CORE_TEST_TOKEN).toBe('from-process-env')
    } finally {
      if (original === undefined) {
        delete process.env.SHARED_CORE_TEST_TOKEN
      } else {
        process.env.SHARED_CORE_TEST_TOKEN = original
      }
    }
  })
})
