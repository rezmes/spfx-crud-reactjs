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
      invoiceItems: [],
      editIndex: null,
      tax: 0,
      addedValue: 0,
      totalSum: 0,
      viewMode: 'initial',
      selectedProformaId: null
    };
  }

  public async componentDidMount() {
    await this.getProformaItems();
  }

  private async getProformaItems() {
    try {
      const proformaItems = await sp.web.lists
        .getByTitle(this.props.listName)
        .items.select("Id", "Title", "ProformaNumber", "CustomerName")
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

  private async getInvoiceItems(proformaID: number) {
    try {
      const invoiceItems = await sp.web.lists
        .getByTitle('invoiceList')
        .items.filter(`ProformaIDId eq ${proformaID}`)
        .get<IInvoiceItem[]>();

      this.setState({
        invoiceItems: invoiceItems.map((item, index) => ({
          ...item,
          rowNumber: index + 1
        }))
      });
    } catch (err) {
      console.error('Error fetching invoice items:', err);
    }
  }

  private async generateProformaNumber() {
    try {
      const proformaItems = await sp.web.lists
        .getByTitle('ProformaList')
        .items.select("ProformaNumber")
        .orderBy("ProformaNumber", false)
        .top(1)
        .get();

      const lastProformaNumber = proformaItems.length > 0 ? parseInt(proformaItems[0].ProformaNumber) : 0;
      const newProformaNumber = lastProformaNumber + 1;

      this.setState(prevState => ({
        proforma: { ...prevState.proforma, ProformaNumber: newProformaNumber.toString() }
      }));
    } catch (err) {
      console.error('Error generating Proforma number:', err);
    }
  }

  private async createProforma() {
    try {
      const proforma = await sp.web.lists.getByTitle('ProformaList').items.add({
        CustomerName: this.state.proforma.CustomerName,
        ProformaNumber: this.state.proforma.ProformaNumber
      });

      const proformaID = proforma.data.Id;

      console.log('Proforma ID:', proformaID);
      console.log('Invoice Items:', this.state.invoiceItems);

      await new Promise(resolve => setTimeout(resolve, 1000));

      for (const item of this.state.invoiceItems) {
        const invoiceData = {
          ProformaIDId: proformaID,
          ItemName: item.ItemName,
          itemNumber: Number(item.itemNumber),
          PricePerUnit: Number(item.PricePerUnit)
        };

        console.log('Invoice Data:', invoiceData);

        if (!invoiceData.ItemName || isNaN(invoiceData.itemNumber) || isNaN(invoiceData.PricePerUnit)) {
          throw new Error('Invalid invoice data');
        }

        await sp.web.lists.getByTitle('invoiceList').items.add(invoiceData);
      }

      this.setState({
        status: 'Proforma and items created successfully',
        proforma: { CustomerName: '', ProformaNumber: '' },
        invoiceItems: [],
        viewMode: 'initial'
      });
      await this.getProformaItems();
      await this.generateProformaNumber();
    } catch (err) {
      console.error('Error details:', err);
      this.setState({ status: `Error: ${err.message}` });
    }
  }

  private async deleteProforma(id: number) {
    try {
      const invoiceItems = await sp.web.lists.getByTitle('invoiceList').items.filter(`ProformaIDId eq ${id}`).get();
      for (const item of invoiceItems) {
        await sp.web.lists.getByTitle('invoiceList').items.getById(item.Id).delete();
      }

      await sp.web.lists.getByTitle(this.props.listName).items.getById(id).delete();
      this.setState(prevState => ({
        items: prevState.items.filter(item => item.Id !== id),
        status: 'Proforma item deleted successfully'
      }));
    } catch (err) {
      console.error('Error details:', err);
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
    this.setState({ invoiceItems: newInvoiceItems }, this.calculateTotalSum);
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

  private handleCreateProformaClick = async () => {
    await this.generateProformaNumber();
    this.setState({ viewMode: 'create' });
    this.addInvoiceItem();
  }

  private handleViewProformaClick = () => {
    this.setState({ viewMode: 'view' });
  }

  private handleSelectProforma = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProformaId = Number(event.target.value);
    if (selectedProformaId) {
      const selectedProforma = this.state.items.find(item => item.Id === selectedProformaId);
      if (selectedProforma) {
        this.setState({
          proforma: {
            CustomerName: selectedProforma.CustomerName,
            ProformaNumber: selectedProforma.ProformaNumber
          },
          selectedProformaId
        });
        await this.getInvoiceItems(selectedProformaId);
      }
    }
  }

  private handleCancelForm = () => {
    this.setState({
      proforma: { CustomerName: '', ProformaNumber: '' },
      invoiceItems: [],
      status: 'Form reset successfully',
      viewMode: 'initial'
    });
  }

  private handleTaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    this.setState({ tax: parseFloat(value) }, this.calculateTotalSum);
  }

  private handleAddedValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    this.setState({ addedValue: parseFloat(value) }, this.calculateTotalSum);
  }

  private calculateTotalSum = () => {
    const { invoiceItems, tax, addedValue } = this.state;
    const totalSum = invoiceItems.reduce((sum, item) => sum + (item.itemNumber * item.PricePerUnit), 0);
    const finalSum = totalSum * (1 + tax / 100) * (1 + addedValue / 100);
    this.setState({ totalSum: finalSum });
  }

  private handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      this.addInvoiceItem();
    }
  }

  private handleEditInvoiceItem = (index: number) => {
    this.setState({ editIndex: index });
  }

  private handleSaveInvoiceItem = () => {
    this.setState({ editIndex: null });
  }

  public render(): React.ReactElement<IReactCrudProps> {
    const { viewMode, proforma, invoiceItems, totalSum, tax, addedValue, items, selectedProformaId, editIndex } = this.state;

    return (
      <div className={styles.reactCrud}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Welcome to SharePoint!</span>
              <p className={styles.subTitle}>Customize SharePoint experiences using Web Parts.</p>
              <p className={styles.description}>{escape(this.props.listName)}</p>

              {viewMode === 'initial' ? (
                <>
                  <button onClick={this.handleCreateProformaClick}>Create Proforma</button>
                  <button onClick={this.handleViewProformaClick}>View Proforma</button>
                </>
              ) : viewMode === 'create' ? (
                <form onSubmit={this.handleProformaFormSubmit}>
                  <div className={styles['form-group']}>
                    <label htmlFor="CustomerName">Customer Name</label>
                    <input
                      type="text"
                      id="CustomerName"
                      name="CustomerName"
                      value={proforma.CustomerName}
                      onChange={this.handleProformaInputChange}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label htmlFor="ProformaNumber">Proforma Number</label>
                    <input
                      type="text"
                      id="ProformaNumber"
                      name="ProformaNumber"
                      value={proforma.ProformaNumber}
                      onChange={this.handleProformaInputChange}
                      placeholder="Enter Proforma number"
                      required
                      readOnly
                    />
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Row Number</th>
                        <th>Item Name</th>
                        <th>Item Number</th>
                        <th>Price per Unit</th>
                        <th>Total Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <input
                              type="text"
                              id={`ItemName-${index}`}
                              name="ItemName"
                              value={item.ItemName}
                              onChange={(e) => this.handleInvoiceInputChange(index, e)}
                              onKeyDown={(e) => this.handleKeyDown(e, index)}
                              placeholder="Enter item name"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              id={`itemNumber-${index}`}
                              name="itemNumber"
                              value={item.itemNumber}
                              onChange={(e) => this.handleInvoiceInputChange(index, e)}
                              onKeyDown={(e) => this.handleKeyDown(e, index)}
                              placeholder="Enter item number"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              id={`PricePerUnit-${index}`}
                              name="PricePerUnit"
                              value={item.PricePerUnit}
                              onChange={(e) => this.handleInvoiceInputChange(index, e)}
                              onKeyDown={(e) => this.handleKeyDown(e, index)}
                              placeholder="Enter price per unit"
                              required
                            />
                          </td>
                          <td>{item.itemNumber * item.PricePerUnit}</td>
                          <td>
                            <button type="button" onClick={() => this.handleEditInvoiceItem(index)}>Edit</button>
                            <button type="button" onClick={() => this.deleteProforma(item.Id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p>Total Sum: {totalSum.toFixed(2)}</p>
                  <p>
                    Tax:
                    <input type="number" value={tax} onChange={this.handleTaxChange} />%
                  </p>
                  <p>
                    Added Value:
                    <input type="number" value={addedValue} onChange={this.handleAddedValueChange} />%
                  </p>
                  <button type="submit">Submit</button>
                  <button type="button" onClick={this.handleCancelForm}>Cancel</button>
                </form>
              ) : (
                <div>
                  <select onChange={this.handleSelectProforma}>
                    <option value="">Select Proforma</option>
                    {items.map(item => (
                      <option key={item.Id} value={item.Id}>{item.Title} - {item.ProformaNumber}</option>
                    ))}
                  </select>
                  {selectedProformaId && (
                    <>
                      <p>Customer Name: {proforma.CustomerName}</p>
                      <p>Proforma Number: {proforma.ProformaNumber}</p>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Row Number</th>
                            <th>Item Name</th>
                            <th>Item Number</th>
                            <th>Price per Unit</th>
                            <th>Total Price</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems.map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.ItemName}</td>
                              <td>{item.itemNumber}</td>
                              <td>{item.PricePerUnit}</td>
                              <td>{item.itemNumber * item.PricePerUnit}</td>
                              <td>
                                <button type="button" onClick={() => this.handleEditInvoiceItem(index)}>Edit</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button type="button" onClick={this.handleCancelForm}>Back</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
