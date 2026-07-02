import { Link, Route, Routes } from 'react-router-dom';

import type { Item } from './types';

export function CatalogHome({ items }: { items: Item[] }) {
  return (
    <main>
      <h1>Items</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <Link to={`/items/${item.id}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function AppRoutes({ items }: { items: Item[] }) {
  return (
    <Routes>
      <Route path="/" element={<CatalogHome items={items} />} />
    </Routes>
  );
}
