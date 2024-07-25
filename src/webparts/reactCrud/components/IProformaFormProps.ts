import { IProformaItem } from './IProformaItem';

export interface IProformaFormProps {
  proforma: IProformaItem;
  onProformaInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProformaFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancelForm: () => void;
  tax: number;
  addedValue: number;
  onTaxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddedValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
