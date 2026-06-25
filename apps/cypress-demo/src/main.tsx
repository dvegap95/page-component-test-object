import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Home, ItemDetail } from '@pco/demo-shared/views';

const items = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' },
];

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" render={() => <Home items={items} loading={false} />} />
      <Route
        path="/items/:id"
        render={({ match }) => {
          const item = items.find((i) => i.id === match.params.id) ?? null;
          return <ItemDetail item={item} />;
        }}
      />
    </Switch>
  </BrowserRouter>,
);
