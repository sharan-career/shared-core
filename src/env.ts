import type { z } from 'zod'

/** Raised when environment configuration fails validation. */
export class EnvValidationError extends Error {
  readonly issues: readonly string[]

  constructor(issues: readonly string[]) {
    super(`Invalid environment configuration: ${issues.join('; ')}`)
    this.name = 'EnvValidationError'
    this.issues = issues
  }
}

/**
 * Validates environment variables against a Zod schema and returns typed values.
 *
 * Failures list the variable names and Zod's messages only. Values are never
 * included, so secrets cannot leak through startup logs.
 */
export function parseEnv<TSchema extends z.ZodType>(
  schema: TSchema,
  source: Readonly<Record<string, string | undefined>> = process.env,
): z.output<TSchema> {
  const result = schema.safeParse(source)
  if (result.success) {
    return result.data as z.output<TSchema>
  }

  const issues = result.error.issues.map((issue) => {
    const name = issue.path.map(String).join('.') || '(root)'
    return `${name}: ${issue.message}`
  })
  throw new EnvValidationError(issues)
}
