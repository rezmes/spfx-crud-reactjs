import { IListItem } from './IListItem';
import { IProformaItem } from './IProformaItem';
import { IInvoiceItem } from './IInvoiceItem';

export interface IReactCrudState {
  status: string;
  items: IListItem[];
  proforma: IProformaItem;
  invoiceItems: IInvoiceItem[];
  tax: number;
  addedValue:number;
  totalSum: number;
  viewMode: string;
  selectedProformaId: number;
  editIndex: number | null; // Add this line
  //editMode: boolean;
  //editItemId: number | null; // Track which item is being edited
}

