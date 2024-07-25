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
import ProformaForm from './ProformaForm';
import InvoiceTable from './InvoiceTable';
import jsPDF from 'jspdf';
require('jspdf-autotable');

class ReactCrud extends React.Component<IReactCrudProps, IReactCrudState> {
  constructor(props: IReactCrudProps) {
    super(props);

    this.state = {
      status: 'Ready',
      items: [],
      proforma: {
        CustomerName: '',
        ProformaNumber: ''
      },
      invoiceItems: [], // Initialize as an empty array
      totalSum: 0,
      tax: 0,
      addedValue: 0,
      viewMode: 'initial',
      selectedProformaId: null,
      editIndex: null
    };
  }

  public async componentDidMount() {
    await this.getProformaItems();
  }

  private async getProformaItems() {
    try {
      const proformaItems: IListItem[] = await sp.web.lists
        .getByTitle(this.props.listName)
        .items.select("Id", "CustomerName", "ProformaNumber")
        .get();

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

  private async getInvoiceItems(proformaId: number) {
    try {
      const invoiceItems: IInvoiceItem[] = await sp.web.lists
        .getByTitle('invoiceList')
        .items.filter(`ProformaIDId eq ${proformaId}`)
        .get();

      this.setState({ invoiceItems });
    } catch (err) {
      this.setState({
        status: `Error fetching invoice items: ${err.message}`,
        invoiceItems: []
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

      // Adding a small delay to ensure the Proforma item is fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create the Invoice items
      for (const item of this.state.invoiceItems) {
        const invoiceData = {
          ProformaIDId: proformaID, // Ensure the lookup field is set correctly
          ItemName: item.ItemName,
          itemNumber: Number(item.itemNumber), // Ensure it's a number
          PricePerUnit: Number(item.PricePerUnit) // Ensure it's a number
        };

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
      invoiceItems: [...prevState.invoiceItems, { ProformaID: 0, ItemName: '', itemNumber: 0, PricePerUnit: 0 }]
    }));
  }

  private handleProformaFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.createProforma();
  }

  private handleSaveInvoiceItem = (index: number) => {
    // Logic to save individual invoice item if needed
  }

  private handleEditInvoiceItem = (index: number) => {
    this.setState({ editIndex: index });
  }

  private generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Proforma Invoice', 20, 10);

    const tableColumn = ['Row Number', 'Item Name', 'Item Number', 'Price per Unit', 'Total Price'];
    const tableRows = [];

    this.state.invoiceItems.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.ItemName,
        item.itemNumber,
        item.PricePerUnit,
        item.itemNumber * item.PricePerUnit
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });

    doc.save(`Proforma_${this.state.proforma.ProformaNumber}.pdf`);
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

              {this.state.viewMode === 'initial' && (
                <div>
                  <button onClick={() => this.setState({ viewMode: 'create' })}>Create Proforma</button>
                  <button onClick={() => this.setState({ viewMode: 'view' })}>View Proforma</button>
                </div>
              )}

              {this.state.viewMode === 'view' && (
                <div>
                  <select
                    onChange={async (e) => {
                      const proformaId = parseInt(e.target.value, 10);
                      this.setState({ selectedProformaId: proformaId });
                      await this.getInvoiceItems(proformaId);
                    }}
                    value={this.state.selectedProformaId || ''}
                    title="Select Proforma"
                  >
                    <option value="">Select Proforma</option>
                    {this.state.items.map(item => (
                      <option key={item.Id} value={item.Id}>{item.CustomerName}</option>
                    ))}
                  </select>
                  {this.state.selectedProformaId && (
                    <InvoiceTable
                      invoiceItems={this.state.invoiceItems}
                      onInvoiceInputChange={this.handleInvoiceInputChange}
                      onAddInvoiceItem={this.addInvoiceItem}
                      onSaveInvoiceItem={this.handleSaveInvoiceItem}
                      onEditInvoiceItem={this.handleEditInvoiceItem}
                    />
                  )}
                </div>
              )}

              {this.state.viewMode === 'create' && (
                <div>
                  <ProformaForm
                    proforma={this.state.proforma}
                    onProformaInputChange={this.handleProformaInputChange}
                    onProformaFormSubmit={this.handleProformaFormSubmit}
                    onCancelForm={() => this.setState({ viewMode: 'initial' })}
                    tax={this.state.tax}
                    addedValue={this.state.addedValue}
                    onTaxChange={(e) => this.setState({ tax: Number(e.target.value) })}
                    onAddedValueChange={(e) => this.setState({ addedValue: Number(e.target.value) })}
                  />
                  <InvoiceTable
                    invoiceItems={this.state.invoiceItems}
                    onInvoiceInputChange={this.handleInvoiceInputChange}
                    onAddInvoiceItem={this.addInvoiceItem}
                    onSaveInvoiceItem={this.handleSaveInvoiceItem}
                    onEditInvoiceItem={this.handleEditInvoiceItem}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ReactCrud;
