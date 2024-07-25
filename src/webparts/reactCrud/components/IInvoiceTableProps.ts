import { IInvoiceItem } from './IInvoiceItem';

export interface IInvoiceTableProps {
  invoiceItems: IInvoiceItem[];
  onInvoiceInputChange: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddInvoiceItem: () => void;
  onSaveInvoiceItem: (index: number) => void;
  onEditInvoiceItem: (index: number) => void;
}
