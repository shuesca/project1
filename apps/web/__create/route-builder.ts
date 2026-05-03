import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

/** Map URL segments under `api/` to Hono path patterns (same rules as before). */
function getHonoPathFromRouteParts(routeParts: string[]) {
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

const routeGlob = import.meta.glob('../src/app/api/**/route.js');

async function registerRoutes() {
  const entries = Object.entries(routeGlob).sort((a, b) => b[0].length - a[0].length);

  api.routes = [];

  for (const [globPath, loader] of entries) {
    const m = globPath.match(/^\.\.\/src\/app\/api\/(.+)\/route\.js$/);
    if (!m) continue;
    const routeSubpath = m[1];
    const routeParts = routeSubpath.split('/').filter(Boolean);
    const syntheticFile = `api/${routeSubpath}/route.js`;

    try {
      const route = await loader();
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
      for (const method of methods) {
        try {
          const handlerFn = (route as Record<string, unknown>)[method];
          if (typeof handlerFn !== 'function') continue;

          const parts = getHonoPathFromRouteParts(routeParts);
          const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
          const handler: Handler = async (c) => {
            const params = c.req.param();
            if (import.meta.env.DEV) {
              const updatedRoute = (await loader()) as Record<string, (req: Request, ctx: unknown) => Promise<Response>>;
              return await updatedRoute[method](c.req.raw, { params });
            }
            return await (handlerFn as (req: Request, ctx: unknown) => Promise<Response>)(
              c.req.raw,
              { params },
            );
          };
          const methodLowercase = method.toLowerCase();
          switch (methodLowercase) {
            case 'get':
              api.get(honoPath, handler);
              break;
            case 'post':
              api.post(honoPath, handler);
              break;
            case 'put':
              api.put(honoPath, handler);
              break;
            case 'delete':
              api.delete(honoPath, handler);
              break;
            case 'patch':
              api.patch(honoPath, handler);
              break;
            default:
              console.warn(`Unsupported method: ${method}`);
          }
        } catch (error) {
          console.error(`Error registering route ${syntheticFile} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error importing route ${syntheticFile}:`, error);
    }
  }
}

await registerRoutes();

if (import.meta.env.DEV) {
  import.meta.glob('../src/app/api/**/route.js', { eager: true });
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}

export { api, API_BASENAME };
