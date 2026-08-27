/**
 * Centralized Web Client Environment Configuration
 */
export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
} as const;

// Warn at runtime if production environment is missing critical variables
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    '⚠️ Warning: NEXT_PUBLIC_API_URL environment variable is not defined in production. ' +
      'Falling back to http://localhost:4000, which may lead to connection issues if the API is hosted elsewhere.',
  );
}
