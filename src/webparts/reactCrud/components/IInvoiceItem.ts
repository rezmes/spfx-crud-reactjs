// export interface IInvoiceItem {
//   ItemName: string;
//   itemNumber: number;
//   PricePerUnit: number;
//  // TotalPrice: number; // Calculated field
// }
// IInvoiceItem.ts
export interface IInvoiceItem {
  Id?: number; // Add optional Id for updates
  ProformaIDId: number;
  ItemName: string;
  itemNumber: number;
  PricePerUnit: number;
  TotalPrice: number; // If you are using this for display purposes only
  isEditing?: boolean; // Optional property
  rowNumber: number;
}
