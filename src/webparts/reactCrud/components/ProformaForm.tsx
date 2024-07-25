import * as React from 'react';
import { IProformaFormProps } from './IProformaFormProps';

class ProformaForm extends React.Component<IProformaFormProps> {
  public render() {
    const {
      proforma,
      onProformaInputChange,
      onProformaFormSubmit,
      onCancelForm,
      tax,
      addedValue,
      onTaxChange,
      onAddedValueChange
    } = this.props;

    return (
      <form onSubmit={onProformaFormSubmit}>
        <div>
          <label htmlFor="CustomerName">Customer Name</label>
          <input
            type="text"
            id="CustomerName"
            name="CustomerName"
            value={proforma.CustomerName}
            onChange={onProformaInputChange}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div>
          <label htmlFor="ProformaNumber">Proforma Number</label>
          <input
            type="text"
            id="ProformaNumber"
            name="ProformaNumber"
            value={proforma.ProformaNumber}
            onChange={onProformaInputChange}
            placeholder="Enter Proforma number"
            required
          />
        </div>
        <div>
          <label htmlFor="Tax">Tax</label>
          <input
            type="number"
            id="Tax"
            name="Tax"
            value={tax}
            onChange={onTaxChange}
            placeholder="Enter tax percentage"
            required
          />
        </div>
        <div>
          <label htmlFor="AddedValue">Added Value</label>
          <input
            type="number"
            id="AddedValue"
            name="AddedValue"
            value={addedValue}
            onChange={onAddedValueChange}
            placeholder="Enter added value percentage"
            required
          />
        </div>
        <button type="submit">Save Proforma</button>
        <button type="button" onClick={onCancelForm}>Cancel</button>
      </form>
    );
  }
}

export default ProformaForm;
