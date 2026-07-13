import {
  getPcoAdapter,
  registerDefaultPcoAdapter,
  type ContextResolver,
  type PCOContext,
} from '@page-component-object/core';

import { createRtlPCOContext, rtlPcoAdapter } from './rtlContext';

registerDefaultPcoAdapter(rtlPcoAdapter);

export function createPcoContext(
  rootResolver: ContextResolver<HTMLElement>,
): PCOContext {
  const adapter = getPcoAdapter() ?? rtlPcoAdapter;
  return adapter.createContext(rootResolver);
}

export { createRtlPCOContext, rtlPcoAdapter };
