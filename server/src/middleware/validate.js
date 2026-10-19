/**
 * Express middleware helper to validate incoming requests against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // Replace with sanitized/validated data
      next();
    } catch (error) {
      next(error); // errorHandler middleware catches ZodError
    }
  };
}
