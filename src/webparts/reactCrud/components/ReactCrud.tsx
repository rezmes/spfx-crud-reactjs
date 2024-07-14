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
      items: []
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



            </div>
          </div>
        </div>
      </div>
    );
  }
}
