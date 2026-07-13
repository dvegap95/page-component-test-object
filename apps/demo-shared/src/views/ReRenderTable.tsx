import { useState } from 'react';

export interface ReRenderRow {
  id: string;
  label: string;
}

interface ReRenderTableProps {
  rows: ReRenderRow[];
}

/** Demo view — re-renders row data to exercise PCOTarget re-resolution. */
export function ReRenderTable({ rows }: ReRenderTableProps) {
  const [version, setVersion] = useState(0);

  return (
    <section aria-label="re-render demo">
      <button type="button" onClick={() => setVersion((v) => v + 1)}>
        Re-render rows
      </button>
      <p role="status">version:{version}</p>
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.id}-${version}`}>
              <td>
                <button type="button">{row.label}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
