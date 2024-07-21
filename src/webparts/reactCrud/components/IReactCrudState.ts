import { IListItem } from './IListItem';

export interface IReactCrudState {
  status: string;
  items: IListItem[];
  newItemTitle: string; // Add this line
}
