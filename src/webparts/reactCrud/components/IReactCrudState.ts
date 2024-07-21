import { IListItem } from './IListItem';

export interface IReactCrudState {
  status: string;
  items: IListItem[];
  newItemTitle: string; // Add this line
  newItemBillTo: string; // Add this line
    // Add these for update operation
    updateItemId: number | null;
    updateItemTitle: string;
    updateItemBillTo: string;
}
