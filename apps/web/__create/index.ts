import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/cloudflare';
import { serializeError } from 'serialize-error';
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';

neonConfig.webSocketConstructor = globalThis.WebSocket;

/** Cloudflare bindings + local dev fallbacks (see wrangler.toml / .env). */
export type WorkerBindings = {
  ASSETS?: { fetch: typeof fetch };
  MEDIA?: R2Bucket;
  AUTH_SECRET?: string;
  DATABASE_URL?: string;
  CORS_ORIGINS?: string;
};

let poolSingleton: Pool | null = null;
let poolForUrl: string | null = null;

function getPool(databaseUrl: string): Pool {
  if (poolSingleton && poolForUrl === databaseUrl) return poolSingleton;
  poolSingleton = new Pool({ connectionString: databaseUrl });
  poolForUrl = databaseUrl;
  return poolSingleton;
}

function getDatabaseUrl(): string | undefined {
  try {
    const c = getContext<{ Bindings: WorkerBindings }>();
    return c.env.DATABASE_URL ?? process.env.DATABASE_URL;
  } catch {
    return process.env.DATABASE_URL;
  }
}

function getAdapter() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('DATABASE_URL is not set (bindings or process.env)');
  }
  return NeonAdapter(getPool(url));
}

const app = new Hono<{ Bindings: WorkerBindings }>();
const R2_VIDEO_FILES = new Set([
  'Fluid.mp4',
  'JellyFish.mp4',
  'Ocean.mp4',
  'Sphere.mp4',
  'drone.mp4',
]);

app.use('*', requestId());

app.use(contextStorage());

app.get('/:filename', async (c, next) => {
  const filename = c.req.param('filename');
  if (!R2_VIDEO_FILES.has(filename)) return next();

  const bucket = c.env.MEDIA;
  if (!bucket) return next();

  const range = c.req.header('range');
  const object = await bucket.get(filename, range ? { range: parseRange(range) } : undefined);
  if (!object?.body) return next();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  if (range) {
    const parsed = parseRange(range);
    const offset = parsed.offset ?? 0;
    const length = parsed.length ?? Math.max(object.size - offset, 0);
    const end = Math.min(offset + length - 1, object.size - 1);
    headers.set('content-range', `bytes ${offset}-${end}/${object.size}`);
    headers.set('content-length', String(Math.max(end - offset + 1, 0)));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set('content-length', String(object.size));
  return new Response(object.body, { headers });
});

function parseRange(range: string): { offset?: number; length?: number; suffix?: number } {
  const match = range.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return {};

  const [, start, end] = match;
  if (!start && end) return { suffix: Number(end) };
  if (!start) return {};

  const offset = Number(start);
  if (!end) return { offset };

  const endNumber = Number(end);
  return { offset, length: Math.max(endNumber - offset + 1, 0) };
}

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500,
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

app.use('/*', async (c, next) => {
  const origins = c.env.CORS_ORIGINS ?? process.env.CORS_ORIGINS;
  if (origins) {
    return cors({
      origin: origins.split(',').map((o) => o.trim()),
    })(c, next);
  }
  return next();
});

for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024,
      onError: (c) => {
        return c.json({ error: 'Body size limit exceeded' }, 413);
      },
    }),
  );
}

app.use(
  '*',
  initAuthConfig((c) => ({
    secret: String(
      c.env.AUTH_SECRET ??
        process.env.AUTH_SECRET ??
        (import.meta.env.DEV ? 'dev-insecure-placeholder' : ''),
    ),
    pages: {
      signIn: '/account/signin',
      signOut: '/account/logout',
    },
    skipCSRFCheck,
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      session({ session, token }) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
    cookies: {
      csrfToken: {
        options: {
          secure: true,
          sameSite: 'none',
        },
      },
      sessionToken: {
        options: {
          secure: true,
          sameSite: 'none',
        },
      },
      callbackUrl: {
        options: {
          secure: true,
          sameSite: 'none',
        },
      },
    },
    providers: [
        ...(import.meta.env.DEV
          ? [
              Credentials({
                id: 'dev-social',
                name: 'Development Social Sign-in',
                credentials: {
                  email: { label: 'Email', type: 'email' },
                  name: { label: 'Name', type: 'text' },
                  provider: { label: 'Provider', type: 'text' },
                },
                authorize: async (credentials) => {
                  const { email, name, provider } = credentials;
                  if (!email || typeof email !== 'string') return null;

                  const adapter = getAdapter();
                  const existing = await adapter.getUserByEmail(email);
                  if (existing) return existing;

                  const allowedProviders = new Set(['google', 'facebook', 'twitter', 'apple']);
                  const providerName =
                    typeof provider === 'string' && allowedProviders.has(provider.toLowerCase())
                      ? provider.toLowerCase()
                      : 'google';
                  const newUser = await adapter.createUser({
                    emailVerified: null,
                    email,
                    name:
                      typeof name === 'string' && name.length > 0
                        ? name
                        : undefined,
                  });
                  await adapter.linkAccount({
                    type: 'oauth',
                    userId: newUser.id,
                    provider: providerName,
                    providerAccountId: `dev-${newUser.id}`,
                  });
                  return newUser;
                },
              }),
            ]
          : []),
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            const adapter = getAdapter();
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              return null;
            }
            const matchingAccount = user.accounts.find(
              (account) => account.provider === 'credentials',
            );
            const accountPassword = matchingAccount?.password;
            if (!accountPassword) {
              return null;
            }

            // bcrypt (Workers-safe). Passwords hashed with argon2 must be reset.
            const isValid = bcrypt.compareSync(password, accountPassword);
            if (!isValid) {
              return null;
            }

            return user;
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
            name: { label: 'Name', type: 'text' },
            image: { label: 'Image', type: 'text', required: false },
          },
          authorize: async (credentials) => {
            const { email, password, name, image } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            const adapter = getAdapter();
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              const newUser = await adapter.createUser({
                emailVerified: null,
                email,
                name: typeof name === 'string' && name.length > 0 ? name : undefined,
                image: typeof image === 'string' && image.length > 0 ? image : undefined,
              });
              await adapter.linkAccount({
                extraData: {
                  password: bcrypt.hashSync(password, 10),
                },
                type: 'credentials',
                userId: newUser.id,
                providerAccountId: newUser.id,
                provider: 'credentials',
              });
              return newUser;
            }
            return null;
          },
        }),
    ],
  }))
);

app.all('/integrations/:path{.+}', async (c) => {
  const queryParams = c.req.query();
  const url = `${import.meta.env.NEXT_PUBLIC_CREATE_BASE_URL ?? process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  const host = import.meta.env.NEXT_PUBLIC_CREATE_HOST ?? process.env.NEXT_PUBLIC_CREATE_HOST;
  const projectGroupId =
    import.meta.env.NEXT_PUBLIC_PROJECT_GROUP_ID ?? process.env.NEXT_PUBLIC_PROJECT_GROUP_ID;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      ...(host
        ? {
            'X-Forwarded-For': host,
            'x-createxyz-host': host,
            Host: host,
          }
        : {}),
      ...(projectGroupId ? { 'x-createxyz-project-group-id': projectGroupId } : {}),
    },
  });
});

app.use('/api/auth/*', async (c, next) => {
  if (isAuthAction(c.req.path)) {
    return authHandler()(c, next);
  }
  return next();
});
app.route(API_BASENAME, api);

export default await createHonoServer({
  app,
  defaultLogger: false,
});
