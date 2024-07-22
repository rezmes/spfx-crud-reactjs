import { IListItem } from './IListItem';
import { IProformaItem } from './IProformaItem';
import { IInvoiceItem } from './IInvoiceItem';

export interface IReactCrudState {
  status: string;
  items: IListItem[];
  proforma: IProformaItem;
  invoiceItems: IInvoiceItem[];
}
