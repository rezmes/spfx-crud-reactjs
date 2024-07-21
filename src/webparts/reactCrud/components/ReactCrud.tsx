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



export default class ReactCrud extends React.Component<IReactCrudProps, IReactCrudState> {

  constructor(props: IReactCrudProps, state: IReactCrudState) {
    super(props);

    this.state = {
      status: 'Ready',
      items: [],
      newItemTitle: '' // Initialize newItemTitle
    };
  }

  public async componentDidMount() {
    await this.getListItems();
  }

  private async getListItems() {
    try {
      const listItems = await sp.web.lists
        .getByTitle(this.props.listName)
        .items.select("Id", "Title")
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

// CREATE
private async createListItem(){
try {
  await sp.web.lists.getByTitle(this.props.listName).items.add({
    Title: this.state.newItemTitle
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
private handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  this.createListItem();
}

  public render(): React.ReactElement<IReactCrudProps> {


    return (
      <div className={ styles.reactCrud }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>Customize SharePoint experiences using Web Parts.</p>
              <p className={ styles.description }>{escape(this.props.listName)}</p>


              <ul>
                {this.state.items.map((item) => (
                  <li key={item.Id}>{item.Title}</li>
                ))}
              </ul>
              <p>{this.state.status}</p>


              <form action="#" onSubmit={this.handleFormSubmit} className="ms-Grid-row">
                <input type="text" value={this.state.newItemTitle} onChange={this.handleInputChange} placeholder='Enter new item' required />
                <button type='submit'>Create</button>
              </form>


            </div>
          </div>
        </div>
      </div>
    );
  }
}
