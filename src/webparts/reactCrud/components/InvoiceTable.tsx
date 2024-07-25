import * as React from 'react';
import { IInvoiceTableProps } from './IInvoiceTableProps';

class InvoiceTable extends React.Component<IInvoiceTableProps> {
  public render() {
    const {
      invoiceItems,
      onInvoiceInputChange,
      onAddInvoiceItem,
      onSaveInvoiceItem,
      onEditInvoiceItem
    } = this.props;

    return (
      <div>
        <button type="button" onClick={onAddInvoiceItem}>Add Item</button>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Row Number</th>
              <th>Item Name</th>
              <th>Item Number</th>
              <th>Price per Unit</th>
              <th>Total Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    name="ItemName"
                    value={item.ItemName}
                    onChange={(e) => onInvoiceInputChange(index, e)}
                    placeholder="Enter item name"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="itemNumber"
                    value={item.itemNumber}
                    onChange={(e) => onInvoiceInputChange(index, e)}
                    placeholder="Enter item number"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="PricePerUnit"
                    value={item.PricePerUnit}
                    onChange={(e) => onInvoiceInputChange(index, e)}
                    placeholder="Enter price per unit"
                    required
                  />
                </td>
                <td>{item.itemNumber * item.PricePerUnit}</td>
                <td>
                  <button type="button" onClick={() => onSaveInvoiceItem(index)}>Save</button>
                  <button type="button" onClick={() => onEditInvoiceItem(index)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default InvoiceTable;
