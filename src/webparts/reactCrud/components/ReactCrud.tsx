import * as React from 'react';
import styles from './ReactCrud.module.scss';
import { IReactCrudProps } from './IReactCrudProps';
import { IReactCrudState } from './IReactCrudState';
import { escape } from '@microsoft/sp-lodash-subset';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs"; // Import webs to add 'sp.web'
import "@pnp/sp/lists"; // Import lists to add 'sp.web.lists'
import "@pnp/sp/items"; // Import items to work with list items
import { IListItem } from "./IListItem";
import { Item } from '@pnp/sp/items';



export default class ReactCrud extends React.Component<IReactCrudProps, IReactCrudState> {

  constructor(props: IReactCrudProps, state: IReactCrudState) {
    super(props);

    this.state = {
      status: 'Ready',
      items: [],
      newItemTitle: '', // Initialize newItemTitle
      newItemBillTo: '', // Initialize newItemBillTo
      updateItemId: null,
      updateItemTitle: '',
      updateItemBillTo: ''
    };
  }

  public async componentDidMount() {
    await this.getListItems();
  }

  private async getListItems() {
    try {
      const listItems = await sp.web.lists
        .getByTitle(this.props.listName)
        .items.select("Id", "Title", "billTo")
        .get<IListItem[]>();

      this.setState({
        status: `Fetched ${listItems.length} items`,
        items: listItems
      });
    } catch (err) {
      this.setState({
        status: `Error: ${err.message}`,
        items: []
      });
    }
  }

  private escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


// CREATE
private async createListItem(){
try {
  await sp.web.lists.getByTitle(this.props.listName).items.add({
    Title: this.state.newItemTitle,
    billTo: this.state.newItemBillTo // Include billTo in the create statement
  });

this.setState({status: `Item created successfully`, newItemTitle: ''});
await this.getListItems(); //Refresh the list
}catch(err){
this.setState({status:`Error: ${err.message}`});
}
}

//handle input change
private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  this.setState({ newItemTitle: event.target.value });
}

// Handle input changes for billTo
private handleBillToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  this.setState({ newItemBillTo: event.target.value });
}

private handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  this.createListItem();
}


// DELET method
private async deleteListItem(id: number) {
  try {
    await sp.web.lists.getByTitle(this.props.listName).items.getById(id).delete();

    this.setState({ status: `Item deleted successfully` });
    await this.getListItems(); // Refresh the list
  } catch (err) {
    this.setState({ status: `Error: ${err.message}` });
  }
}

// Set the item to be updated

private setUpdateItem(item: IListItem) {
  this.setState({
    updateItemId: item.Id,
    updateItemTitle: item.Title,
    updateItemBillTo: item.billTo
  });
}

// Handle input changes for update
private handleUpdateTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

  this.setState({ updateItemTitle: event.target.value });
}
private handleUpdateBillToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const sanitizedInput = this.escapeHtml(event.target.value);
  console.log(sanitizedInput);
  this.setState({ updateItemBillTo: sanitizedInput });
}

// Update the item
private async updateListItem() {
  try {
    if (this.state.updateItemId !== null) {
      await sp.web.lists.getByTitle(this.props.listName).items.getById(this.state.updateItemId).update({
        Title: this.state.updateItemTitle,
        billTo: this.state.updateItemBillTo
      });

      this.setState({ status: `Item updated successfully`, updateItemId: null, updateItemTitle: '', updateItemBillTo: '' });
      await this.getListItems(); // Refresh the list
    }
  } catch (err) {
    this.setState({ status: `Error: ${err.message}` });
  }
}

// Handle form submit for update
private handleUpdateFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  this.updateListItem();
  }

  public render(): React.ReactElement<IReactCrudProps> {

const items: JSX.Element[] = this.state.items.map((item: IListItem, i:number):JSX.Element=>{
  return(
    <li> {i+1}. {item.Title} - <span dangerouslySetInnerHTML={{ __html: item.billTo }} /></li>
  )
})
    return (
      <div className={ styles.reactCrud }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>Customize SharePoint experiences using Web Parts.</p>
              <p className={ styles.description }>{escape(this.props.listName)}</p>
<ul>
  {items}
</ul>

              <ul>
                {this.state.items.map((item) => (
                  <li key={item.Id}>
                    {item.Title} - <span dangerouslySetInnerHTML={{ __html: item.billTo }} />
                    <button onClick={() => this.setUpdateItem(item)}>Update</button> {/* Add update button */}
                    <button onClick={() => this.deleteListItem(item.Id)}>Delete</button> {/* Add delete button */}

                  </li>
                ))}
              </ul>
              <p>{this.state.status}</p>


            {/* Form for creating new item */}
            <form action="#" onSubmit={this.handleFormSubmit} className="ms-Grid-row">
              <input
                type="text"
                value={this.state.newItemTitle}
                onChange={this.handleInputChange}
                placeholder='Enter new item'
                required
              />
              <input
                type="text"
                value={this.state.newItemBillTo}
                onChange={this.handleBillToChange}
                placeholder='Enter billTo'
                required
              />
              <button type='submit'>Create</button>
            </form>

            {/* Form for updating existing item */}
            {this.state.updateItemId !== null && (
              <form action="#" onSubmit={this.handleUpdateFormSubmit} className="ms-Grid-row">
                <input
                  type="text"
                  value={this.state.updateItemTitle}
                  onChange={this.handleUpdateTitleChange}
                  placeholder='Update item title'
                  required
                />
                <input
                  type="text"
                  value={escape(this.state.updateItemBillTo)}
                  onChange={this.handleUpdateBillToChange}
                  placeholder='Update billTo'
                  required
                />
                <button className={styles['update-button']} type='submit'>Update4</button>
                <button type='button' onClick={() => this.setState({ updateItemId: null, updateItemTitle: '', updateItemBillTo: '' })}>Cancel</button>
              </form>
            )}



            </div>
          </div>
        </div>
      </div>
    );
  }
}
