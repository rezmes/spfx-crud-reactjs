import * as React from 'react';
import styles from './ReactCrud.module.scss';
import { IReactCrudProps } from './IReactCrudProps';
import { IReactCrudState } from './IReactCrudState';
import { escape } from '@microsoft/sp-lodash-subset';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IProformaItem } from './IProformaItem';
import { IInvoiceItem } from './IInvoiceItem';
import { IListItem } from './IListItem';

export default class ReactCrud extends React.Component<IReactCrudProps, IReactCrudState> {

  constructor(props: IReactCrudProps) {
    super(props);

    this.state = {
      status: 'Ready',
      items: [],
      proforma: {
        CustomerName: '',
        ProformaNumber: ''
      },
      invoiceItems: []
    };
  }

  public async componentDidMount() {
    await this.getProformaItems();
  }

  private async getProformaItems() {
    try {
      const proformaItems = await sp.web.lists
        .getByTitle(this.props.listName)
        .items.select("Id", "Title")
        .get<IListItem[]>();

      this.setState({
        status: `Fetched ${proformaItems.length} items`,
        items: proformaItems
      });
    } catch (err) {
      this.setState({
        status: `Error: ${err.message}`,
        items: []
      });
    }
  }

  private async createProforma() {
    try {
      // Create the Proforma item
      const proforma = await sp.web.lists.getByTitle('ProformaList').items.add({
        CustomerName: this.state.proforma.CustomerName,
        ProformaNumber: this.state.proforma.ProformaNumber
      });

      const proformaID = proforma.data.Id;

      // Log the proformaID and invoice items
      console.log('Proforma ID:', proformaID);
      console.log('Invoice Items:', this.state.invoiceItems);

      // Adding a small delay to ensure the Proforma item is fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create the Invoice items
      for (const item of this.state.invoiceItems) {
        const invoiceData = {
          ProformaIDId: proformaID, // Ensure the lookup field is set correctly
          ItemName: item.ItemName,
          itemNumber: Number(item.itemNumber), // Ensure it's a number
          PricePerUnit: Number(item.PricePerUnit), // Ensure it's a number
//          TotalPrice: Number(item.itemNumber) * Number(item.PricePerUnit) // Calculated field
        };

        // Log the invoiceData before sending it to SharePoint
        console.log('Invoice Data:', invoiceData);

        // Validate the data before sending
        if (!invoiceData.ItemName || isNaN(invoiceData.itemNumber) || isNaN(invoiceData.PricePerUnit)) {
          throw new Error('Invalid invoice data');
        }

        await sp.web.lists.getByTitle('invoiceList').items.add(invoiceData);
      }

      this.setState({
        status: 'Proforma and items created successfully',
        proforma: { CustomerName: '', ProformaNumber: '' },
        invoiceItems: []
      });
      await this.getProformaItems(); // Refresh the list
    } catch (err) {
      console.error('Error details:', err); // Finding error
      this.setState({ status: `Error: ${err.message}` });
    }
  }

  private handleProformaInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      proforma: { ...prevState.proforma, [name]: value }
    }));
  }

  private handleInvoiceInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const newInvoiceItems = [...this.state.invoiceItems];
    newInvoiceItems[index] = { ...newInvoiceItems[index], [name]: value };
    this.setState({ invoiceItems: newInvoiceItems });
  }

  private addInvoiceItem = () => {
    this.setState(prevState => ({
      invoiceItems: [...prevState.invoiceItems, { ProformaID: 0, ItemName: '', itemNumber: 0, PricePerUnit: 0, TotalPrice: 0 }]
    }));
  }

  private handleProformaFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.createProforma();
  }

  public render(): React.ReactElement<IReactCrudProps> {
    return (
      <div className={styles.reactCrud}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Welcome to SharePoint!</span>
              <p className={styles.subTitle}>Customize SharePoint experiences using Web Parts.</p>
              <p className={styles.description}>{escape(this.props.listName)}</p>

              <ul>
                {this.state.items.map((item) => (
                  <li key={item.Id}>{item.Title}</li>
                ))}
              </ul>
              <p>{this.state.status}</p>

              <form onSubmit={this.handleProformaFormSubmit}>
                <div>
                  <label htmlFor="CustomerName">Customer Name</label>
                  <input
                    type="text"
                    id="CustomerName"
                    name="CustomerName"
                    value={this.state.proforma.CustomerName}
                    onChange={this.handleProformaInputChange}
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
                    value={this.state.proforma.ProformaNumber}
                    onChange={this.handleProformaInputChange}
                    placeholder="Enter Proforma number"
                    required
                  />
                </div>
                <button type="button" onClick={this.addInvoiceItem}>Add Item</button>
                {this.state.invoiceItems.map((item, index) => (
                  <div key={index}>
                    <div>
                      <label htmlFor={`ItemName-${index}`}>Item Name</label>
                      <input
                        type="text"
                        id={`ItemName-${index}`}
                        name="ItemName"
                        value={item.ItemName}
                        onChange={(e) => this.handleInvoiceInputChange(index, e)}
                        placeholder="Enter item name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`itemNumber-${index}`}>Item Number</label>
                      <input
                        type="number"
                        id={`itemNumber-${index}`}
                        name="itemNumber"
                        value={item.itemNumber}
                        onChange={(e) => this.handleInvoiceInputChange(index, e)}
                        placeholder="Enter item number"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`PricePerUnit-${index}`}>Price Per Unit</label>
                      <input
                        type="number"
                        id={`PricePerUnit-${index}`}
                        name="PricePerUnit"
                        value={item.PricePerUnit}
                        onChange={(e) => this.handleInvoiceInputChange(index, e)}
                        placeholder="Enter price per unit"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`TotalPrice-${index}`}>Total Price</label>
                      <input
                        type="number"
                        id={`TotalPrice-${index}`}
                        name="TotalPrice"
                        value={item.itemNumber * item.PricePerUnit}
                        readOnly
                        placeholder="Total price"
                      />
                    </div>
                  </div>
                ))}
                <button type="submit">Create Proforma</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
