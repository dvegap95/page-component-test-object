import React, { type ReactElement, type ReactNode } from 'react';

import { MemoryRouter, Route, Switch, useHistory } from 'react-router-dom';

import type { RouterHistory } from '@pco/core';

export type HistoryCaptureProps = {
  children: ReactNode;
  onReady: (history: RouterHistory) => void;
};

/** Exposes a live `RouterHistory` to test AppManager after mount. */
export function HistoryCapture({ children, onReady }: HistoryCaptureProps) {
  const history = useHistory();
  React.useEffect(() => {
    const routerHistory: RouterHistory = {
      get location() {
        return history.location;
      },
      push: (path: string) => history.push(path),
    };
    onReady(routerHistory);
  }, [history, onReady]);
  return <>{children}</>;
}

export type MemoryRouterProps = {
  initialEntries?: string[];
  initialIndex?: number;
};

export type ShallowRouteOptions = {
  routePath?: string;
  wrapLayout?: (children: ReactElement) => ReactNode;
};

/** Builds the routed subtree for shallow view renders. */
export function buildShallowRouteTree(
  element: ReactElement,
  { routePath, wrapLayout }: ShallowRouteOptions,
): ReactElement {
  if (!routePath) return element;

  const content = wrapLayout ? wrapLayout(element) : element;
  return (
    <Switch>
      <Route path={routePath} render={() => <>{content}</>} />
    </Switch>
  );
}

export type RoutedShellProps = MemoryRouterProps & {
  children: ReactNode;
  onHistoryReady: (history: RouterHistory) => void;
};

export function RoutedShell({
  initialEntries = ['/'],
  initialIndex,
  children,
  onHistoryReady,
}: RoutedShellProps) {
  return (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <HistoryCapture onReady={onHistoryReady}>{children}</HistoryCapture>
    </MemoryRouter>
  );
}
