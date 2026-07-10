import { ComponentTestObject } from '@page-component-object/queries';

import { MuiComponentTestObject } from './MuiComponentTestObject';

export class MuiTableRowTestObject extends MuiComponentTestObject<HTMLTableRowElement> {
  get cells() {
    return Array.from(this.root?.querySelectorAll('td, th') ?? []);
  }

  getCellByIndex(index: number) {
    const cell = this.cells[index] as HTMLTableCellElement | undefined;
    return new MuiComponentTestObject<HTMLTableCellElement>(cell ?? null);
  }

  getByHeaderId(headerId: string) {
    const cell = this.root?.querySelector<HTMLTableCellElement>(`td[headers="${headerId}"]`);
    return new MuiComponentTestObject<HTMLTableCellElement>(cell ?? null);
  }

  static fromRow(row: HTMLTableRowElement | null): MuiTableRowTestObject {
    return new MuiTableRowTestObject(row);
  }

  static rowsIn(parent: ComponentTestObject): MuiTableRowTestObject[] {
    return Array.from(parent.root?.querySelectorAll('tr') ?? []).map((row) =>
      this.fromRow(row as HTMLTableRowElement),
    );
  }
}
