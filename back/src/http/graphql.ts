import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { schema } from '../graphql/schema';
import { extractToken } from '../auth/cookies';
import { verificarToken, type AuthPayload } from '../auth/jwt';
export const yoga = createYoga({
  schema, graphqlEndpoint: '/graphql', graphiql: true, cors: false,
  context: async ({ request }): Promise<{ usuario: AuthPayload | null }> => {
    const token = extractToken(request.headers);
    if (!token) return { usuario: null };
    try { return { usuario: await verificarToken(token) }; } catch { return { usuario: null }; }
  },
  maskedErrors: {
    maskError(error, message, isDev) {
      const gqlErr = error instanceof GraphQLError ? error : (error as any)?.originalError instanceof GraphQLError ? (error as any).originalError : null;
      const safe = new Set(['BAD_USER_INPUT', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN', 'UNAUTHENTICATED']);
      if (gqlErr && safe.has(gqlErr.extensions?.code as string)) return gqlErr;
      console.error('[graphql] Unhandled:', error);
      return new GraphQLError(isDev ? message : 'Unexpected error.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    },
  },
});
