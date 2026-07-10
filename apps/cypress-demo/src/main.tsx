import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';

import { Home, ItemDetail } from '@page-component-object/demo-shared/views';

const items = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' },
];

function ItemDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const item = items.find((i) => i.id === id) ?? null;
  return <ItemDetail item={item} />;
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home items={items} loading={false} />} />
      <Route path="/items/:id" element={<ItemDetailRoute />} />
    </Routes>
  </BrowserRouter>,
);
