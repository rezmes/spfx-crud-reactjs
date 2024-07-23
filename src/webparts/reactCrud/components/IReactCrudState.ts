import { IListItem } from './IListItem';
import { IProformaItem } from './IProformaItem';
import { IInvoiceItem } from './IInvoiceItem';

export interface IReactCrudState {
  status: string;
  items: IListItem[];
  proforma: IProformaItem;
  invoiceItems: IInvoiceItem[];
  editIndex: number;
  tax: number;
  addedValue:number;
  totalSum: number;
  viewMode: string;
  selectedProformaId: number;
  //editMode: boolean;
  //editItemId: number | null; // Track which item is being edited
}

