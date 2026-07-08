import React from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';

import type { Item } from '../types';

type HomeProps = {
  items: Item[];
  loading: boolean;
};

export function Home({ items, loading }: HomeProps) {
  if (loading) {
    return <p role="status">Loading items…</p>;
  }

  const [selected, setSelected] = React.useState('Option A');

  return (
    <main>
      <h1>Items</h1>
      <ul aria-label="items list">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={`/items/${item.id}`}>{item.name}</Link>
          </li>
        ))}
      </ul>

      <div>
        <label htmlFor="demo-select">Demo select</label>
        <select
          id="demo-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="Option A">Option A</option>
          <option value="Option B">Option B</option>
          <option value="Option C">Option C</option>
        </select>
      </div>

      <p role="status" aria-live="polite">
        Selected: {selected}
      </p>
    </main>
  );
}

export function ItemDetail({ item }: { item: Item | null }) {
  if (!item) {
    return <p role="status">Item not found</p>;
  }

  return (
    <main>
      <h1>{item.name}</h1>
      <Link to="/">Back to list</Link>
    </main>
  );
}

function ItemDetailRoute({ items }: { items: Item[] }) {
  const { id } = useParams<{ id: string }>();
  const item = items.find((i) => i.id === id) ?? null;
  return <ItemDetail item={item} />;
}

export function DemoApp() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    void fetch('/api/items')
      .then((r) => r.json())
      .then((data: Item[]) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home items={items} loading={loading} />} />
      <Route path="/items/:id" element={<ItemDetailRoute items={items} />} />
    </Routes>
  );
}
