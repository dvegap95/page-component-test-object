import { http, HttpResponse, type HttpHandler, type PathParams } from 'msw';
import { setupServer, type SetupServer } from 'msw/node';

import { getRuntime, type MockFn } from '@pco/core';

type JsonBodyType = Record<string, unknown> | unknown[];
type DefaultBodyType = JsonBodyType | string | null | void;

export type HttpHandlerInfo = {
  request: Request;
  params: PathParams;
  cookies: Record<string, string>;
};

export type FlexibleRestHandler<
  TRequest extends DefaultBodyType = DefaultBodyType,
  TResponse extends DefaultBodyType = DefaultBodyType,
> = (
  info: HttpHandlerInfo & { body?: TRequest },
) => Response | TResponse | Promise<Response> | Promise<TResponse>;

export type FlexibleRequest<
  TRequest extends DefaultBodyType = DefaultBodyType,
  TResponse extends DefaultBodyType = DefaultBodyType,
> =
  | FlexibleRestHandler<TRequest, TResponse>
  | Promise<Response | TResponse>
  | Response
  | TResponse;

export type ResponseTrigger<
  TRequest extends DefaultBodyType = DefaultBodyType,
  TResponse extends DefaultBodyType = DefaultBodyType,
> = (value: FlexibleRequest<TRequest, TResponse>) => Promise<void>;

async function flexibleRequestToResult<
  TRequest extends DefaultBodyType,
  TResponse extends DefaultBodyType,
>(
  request: FlexibleRequest<TRequest, TResponse>,
  info: HttpHandlerInfo & { body?: TRequest },
): Promise<Response> {
  const result = typeof request === 'function' ? await request(info) : request;

  if (result instanceof Response) {
    return result;
  }

  if (typeof result === 'object' && result !== null) {
    return HttpResponse.json(result);
  }

  return new HttpResponse(String(result));
}

async function safeParseBody<T>(request: Request): Promise<T | undefined> {
  try {
    const cloned = request.clone();
    const ct = cloned.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      return (await cloned.json()) as T;
    }
    const text = await cloned.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  } catch {
    return undefined;
  }
}

function flexRequestToHttpHandler<
  TRequest extends DefaultBodyType = DefaultBodyType,
  TResponse extends DefaultBodyType = DefaultBodyType,
>(requestHandler: FlexibleRequest<TRequest, TResponse>) {
  const { spyFactory } = getRuntime();
  const mocked = spyFactory.fn(
    async (enriched: HttpHandlerInfo & { body?: TRequest }): Promise<Response> => {
      return flexibleRequestToResult(requestHandler, enriched);
    },
  );

  const mswResolver = async (info: HttpHandlerInfo): Promise<Response> => {
    const body = await safeParseBody<TRequest>(info.request);
    const enriched = { ...info, body } as HttpHandlerInfo & { body?: TRequest };
    return mocked(enriched);
  };

  return { mswResolver, mocked };
}

export interface ApiMockConfig {
  apiBaseUrl?: string;
}

export default class ApiTestObject {
  static server: SetupServer | null = null;
  static handlers: HttpHandler[] = [];
  static apiBaseUrl = '';

  registerHandler(handler: HttpHandler): void {
    ApiTestObject.handlers.push(handler);
  }

  registerRestHandler<
    TRequest extends DefaultBodyType = DefaultBodyType,
    TResponse extends DefaultBodyType = DefaultBodyType,
  >(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    path: string,
    handler: FlexibleRequest<TRequest, TResponse>,
  ): MockFn {
    const { mswResolver, mocked } = flexRequestToHttpHandler<TRequest, TResponse>(handler);
    const httpHandler = http[method](path, mswResolver);
    this.registerHandler(httpHandler);
    ApiTestObject.server?.use(httpHandler);
    return mocked;
  }

  registerTriggeredRestHandler<
    TRequest extends DefaultBodyType = DefaultBodyType,
    TResponse extends DefaultBodyType = DefaultBodyType,
  >(method: 'get' | 'post' | 'put' | 'delete' | 'patch', path: string) {
    const { spyFactory } = getRuntime();
    let trigger: ResponseTrigger<TRequest, TResponse> | null = null;
    const mockedHandler = spyFactory.fn(async (_: HttpHandlerInfo & { body?: TRequest }) => {});

    const httpHandler = http[method](path, async (info: HttpHandlerInfo): Promise<Response> => {
      const body = await safeParseBody<TRequest>(info.request);
      const enriched = { ...info, body } as HttpHandlerInfo & { body?: TRequest };
      await mockedHandler(enriched);

      return new Promise<Response>((resolve) => {
        trigger = async (value: FlexibleRequest<TRequest, TResponse>) => {
          resolve(await flexibleRequestToResult(value, enriched));
        };
      });
    });

    this.registerHandler(httpHandler);
    ApiTestObject.server?.use(httpHandler);

    const triggerShell: ResponseTrigger<TRequest, TResponse> = async (value) => {
      if (!trigger) throw new Error('Handler has never been called');
      await trigger(value);
    };

    return [mockedHandler, triggerShell] as const;
  }

  static setupServer(): void {
    const refreshTokenHandler = http.post('*/refresh-token', () =>
      HttpResponse.json({ message: 'Refresh token endpoint not mocked in test' }, { status: 500 }),
    );
    this.server = setupServer(refreshTokenHandler, ...ApiTestObject.handlers.reverse());
  }

  static startServer(): void {
    this.server?.listen({ onUnhandledRequest: 'warn' });
  }

  static stopServer(): void {
    this.server?.close();
    this.server = null;
  }

  static resetHandlers(): void {
    this.handlers = [];
  }

  static clear(): void {
    this.stopServer();
    this.resetHandlers();
  }
}

export function resolveApiUrl(path: string): string {
  const base = ApiTestObject.apiBaseUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
