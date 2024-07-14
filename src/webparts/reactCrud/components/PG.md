`IListItem.ts`
```
export interface IListItem {
    Title?: string;
    Id: number;
}
```
`IReactCrudProps.ts`
```
import { SPHttpClient } from '@microsoft/sp-http';

export interface IReactCrudProps {
  listName: string;
  spHttpClient: SPHttpClient;
  siteUrl: string;
}

```
`IReactCrudState.ts`
```
import { IListItem } from './IListItem';

export interface IReactCrudState {
  status: string;
  items: IListItem[];
}
```
`ReactCrud.module.scss`
```
@import '~@microsoft/sp-office-ui-fabric-core/dist/sass/SPFabricCore.scss';

.reactCrud {
  .container {
    max-width: 700px;
    margin: 0px auto;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
  }

  .row {
    @include ms-Grid-row;
    @include ms-fontColor-white;
    background-color: $ms-color-themeDark;
    padding: 20px;
  }

  .column {
    @include ms-Grid-col;
    @include ms-lg10;
    @include ms-xl8;
    @include ms-xlPush2;
    @include ms-lgPush1;
  }

  .title {
    @include ms-font-xl;
    @include ms-fontColor-white;
  }

  .subTitle {
    @include ms-font-l;
    @include ms-fontColor-white;
  }

  .description {
    @include ms-font-l;
    @include ms-fontColor-white;
  }

  .button {
    // Our button
    text-decoration: none;
    height: 32px;

    // Primary Button
    min-width: 80px;
    background-color: $ms-color-themePrimary;
    border-color: $ms-color-themePrimary;
    color: $ms-color-white;

    // Basic Button
    outline: transparent;
    position: relative;
    font-family: "Segoe UI WestEuropean","Segoe UI",-apple-system,BlinkMacSystemFont,Roboto,"Helvetica Neue",sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: $ms-font-size-m;
    font-weight: $ms-font-weight-regular;
    border-width: 0;
    text-align: center;
    cursor: pointer;
    display: inline-block;
    padding: 0 16px;

    .label {
      font-weight: $ms-font-weight-semibold;
      font-size: $ms-font-size-m;
      height: 32px;
      line-height: 32px;
      margin: 0 4px;
      vertical-align: top;
      display: inline-block;
    }
  }
}```
`ReactCrud.tsx`
```
import * as React from 'react';
import styles from './ReactCrud.module.scss';
import { IReactCrudProps } from './IReactCrudProps';
import { IReactCrudState } from './IReactCrudState';
import { escape } from '@microsoft/sp-lodash-subset';
import { IListItem } from './IListItem';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export default class ReactCrud extends React.Component<IReactCrudProps, IReactCrudState> {

  constructor(props: IReactCrudProps, state: IReactCrudState) {
    super(props);

    this.state = {
      status: 'Ready',
      items: []
    };
  }

  public render(): React.ReactElement<IReactCrudProps> {
    const items: JSX.Element[] = this.state.items.map((item: IListItem, i: number): JSX.Element => {
      return (
        <li>{item.Title} ({item.Id}) </li>
      );
    });

    return (
      <div className={ styles.reactCrud }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>Customize SharePoint experiences using Web Parts.</p>
              <p className={ styles.description }>{escape(this.props.listName)}</p>
              
              <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`}>
                <div className='ms-Grid-col ms-u-lg10 ms-u-xl8 ms-u-xlPush2 ms-u-lgPush1'>
                  <a href="#" className={`${styles.button}`} onClick={() => this.createItem()}>
                    <span className={styles.label}>Create item</span>
                  </a>&nbsp;
                  <a href="#" className={`${styles.button}`} onClick={() => this.readItem()}>
                    <span className={styles.label}>Read item</span>
                  </a>
                </div>
              </div>

              <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`}>
                <div className='ms-Grid-col ms-u-lg10 ms-u-xl8 ms-u-xlPush2 ms-u-lgPush1'>
                  <a href="#" className={`${styles.button}`} onClick={() => this.updateItem()}>
                    <span className={styles.label}>Update item</span>
                  </a>&nbsp;
                  <a href="#" className={`${styles.button}`} onClick={() => this.deleteItem()}>
                    <span className={styles.label}>Delete item</span>
                  </a>
                </div>
              </div>

              <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`}>
                <div className='ms-Grid-col ms-u-lg10 ms-u-xl8 ms-u-xlPush2 ms-u-lgPush1'>
                  {this.state.status}
                  <ul>
                    {items}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  private getLatestItemId(): Promise<number> {
    return new Promise<number>((resolve: (itemId: number) => void, reject: (error: any) => void): void => {
      this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/items?$orderby=Id desc&$top=1&$select=id`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': ''
          }
        })
        .then((response: SPHttpClientResponse): Promise<{ value: { Id: number }[] }> => {
          return response.json();
        }, (error: any): void => {
          reject(error);
        })
        .then((response: { value: { Id: number }[] }): void => {
          if (response.value.length === 0) {
            resolve(-1);
          }
          else {
            resolve(response.value[0].Id);
          }
        });
    });
  }

  private createItem(): void {
    this.setState({
      status: 'Creating item...',
      items: []
    });

    const body: string = JSON.stringify({
      'Title': `Item ${new Date()}`
    });

    this.props.spHttpClient.post(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/items`,
    SPHttpClient.configurations.v1,
    {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      },
      body: body
    })
    .then((response: SPHttpClientResponse): Promise<IListItem> => {
      return response.json();
    })
    .then((item: IListItem): void => {
      this.setState({
        status: `Item '${item.Title}' (ID: ${item.Id}) successfully created`,
        items: []
      });
    }, (error: any): void => {
      this.setState({
        status: 'Error while creating the item: ' + error,
        items: []
      });
    });
  }

  private readItem(): void {
    this.setState({
      status: 'Loading latest items...',
      items: []
    });

    this.getLatestItemId()
      .then((itemId: number): Promise<SPHttpClientResponse> => {
        if (itemId === -1) {
          throw new Error('No items found in the list');
        }

        this.setState({
          status: `Loading information about item ID: ${itemId}...`,
          items: []
        });
        return this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/items(${itemId})?$select=Title,Id`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'odata-version': ''
            }
          });
      })
      .then((response: SPHttpClientResponse): Promise<IListItem> => {
        return response.json();
      })
      .then((item: IListItem): void => {
        this.setState({
          status: `Item ID: ${item.Id}, Title: ${item.Title}`,
          items: []
        });
      }, (error: any): void => {
        this.setState({
          status: 'Loading latest item failed with error: ' + error,
          items: []
        });
      });
  }

  private updateItem(): void {
    this.setState({
      status: 'Loading latest items...',
      items: []
    });

    let latestItemId: number = undefined;

    this.getLatestItemId()
      .then((itemId: number): Promise<SPHttpClientResponse> => {
        if (itemId === -1) {
          throw new Error('No items found in the list');
        }

        latestItemId = itemId;
        this.setState({
          status: `Loading information about item ID: ${latestItemId}...`,
          items: []
        });
        
        return this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/items(${latestItemId})?$select=Title,Id`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'odata-version': ''
            }
          });
      })
      .then((response: SPHttpClientResponse): Promise<IListItem> => {
        return response.json();
      })
      .then((item: IListItem): void => {
        this.setState({
          status: 'Loading latest items...',
          items: []
        });

        const body: string = JSON.stringify({
          'Title': `Updated Item ${new Date()}`
        });

        this.props.spHttpClient.post(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/items(${item.Id})`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'Content-type': 'application/json;odata=nometadata',
              'odata-version': '',
              'IF-MATCH': '*',
              'X-HTTP-Method': 'MERGE'
            },
            body: body
          })
          .then((response: SPHttpClientResponse): void => {
            this.setState({
              status: `Item with ID: ${latestItemId} successfully updated`,
              items: []
            });
          }, (error: any): void => {
            this.setState({
              status: `Error updating item: ${error}`,
              items: []
            });
          });
      });
  }

  private deleteItem(): void {
    if (!window.confirm('Are you sure you want to delete the latest item?')) {
      return;
    }

    this.setState({
      status: 'Loading latest items...',
      items: []
    });

    let latestItemId: number = undefined;
    let etag: string = undefined;
    this.getLatestItemId()
      .then((itemId: number): Promise<SPHttpClientResponse> => {
        if (itemId === -1) {
          throw new Error('No items found in the list');
        }

        latestItemId = itemId;
        this.setState({
          status: `Loading information about item ID: ${latestItemId}...`,
          items: []
        });

        return this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/items(${latestItemId})?$select=Id`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'odata-version': ''
            }
          });
      })
      .then((response: SPHttpClientResponse): Promise<IListItem> => {
        etag = response.headers.get('ETag');
        return response.json();
      })
      .then((item: IListItem): Promise<SPHttpClientResponse> => {
        this.setState({
          status: `Deleting item with ID: ${latestItemId}...`,
          items: []
        });

        return this.props.spHttpClient.post(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/items(${item.Id})`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'Content-type': 'application/json;odata=verbose',
              'odata-version': '',
              'IF-MATCH': etag,
              'X-HTTP-Method': 'DELETE'
            }
          });
      })
      .then((response: SPHttpClientResponse): void => {
        this.setState({
          status: `Item with ID: ${latestItemId} successfully deleted`,
          items: []
        });
      }, (error: any): void => {
        this.setState({
          status: `Error deleting item: ${error}`,
          items: []
        });
      });
  }
}
```

`ReactCrudWebPart.manifest.js`
```
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/client-side-web-part-manifest.schema.json",
  "id": "bda5effd-e0ee-4e5a-af56-24f49158dcf7",
  "alias": "ReactCrudWebPart",
  "componentType": "WebPart",

  // The "*" signifies that the version should be taken from the package.json
  "version": "*",
  "manifestVersion": 2,

  // If true, the component can only be installed on sites where Custom Script is allowed.
  // Components that allow authors to embed arbitrary script code should set this to true.
  // https://support.office.com/en-us/article/Turn-scripting-capabilities-on-or-off-1f2c515f-5d7e-448a-9fd7-835da935584f
  "requiresCustomScript": true,

  "preconfiguredEntries": [
    {
      "groupId": "5c03119e-3074-46fd-976b-c60198311f70", // Other
      "group": { "default": "Other" },
      "title": {
        "default": "ReactCRUD",
        "en-us": "ReactCRUD",
        "fa-IR": "کراد ریکت"
      },
      "description": {
        "default": "CRUD operations with React JS",
        "en-us": "CRUD operations with React JS",
        "fa-IR": "عملکرد کراد با استفاده از ریکت"
      },
      "officeFabricIconFontName": "Page",
      "properties": {
        "description": "ReactCRUD"
      },
      "dependencies": {
        "sp-http": "1.0.0"
      }
    }
  ]
}
```
`Package.json`
```
{
  "name": "spfx-crud-reactjs",
  "version": "0.0.1",
  "private": true,
  "engines": {
    "node": ">=0.10.0"
  },
  "scripts": {
    "build": "gulp bundle",
    "clean": "gulp clean",
    "test": "gulp test"
  },
  "dependencies": {
    "react": "15.6.2",
    "react-dom": "15.6.2",
    "@types/react": "15.6.6",
    "@types/react-dom": "15.5.6",
    "@microsoft/sp-core-library": "~1.4.0",
    "@microsoft/sp-webpart-base": "~1.4.0",
    "@microsoft/sp-lodash-subset": "~1.4.0",
    "@microsoft/sp-office-ui-fabric-core": "~1.4.0",
    "@types/webpack-env": "1.13.1",
    "@types/es6-promise": "0.0.33",
    "@pnp/sp": "2.0.9",
    "@pnp/spfx-controls-react": "^1.19.0",
    "jspdf": "^1.5.3"
  },
  "resolutions": {
    "@types/react": "15.6.6"
  },
  "devDependencies": {
    "@microsoft/sp-build-web": "~1.4.1",
    "@microsoft/sp-module-interfaces": "~1.4.1",
    "@microsoft/sp-webpart-workbench": "~1.4.1",
    "gulp": "~3.9.1",
    "@types/chai": "3.4.34",
    "@types/mocha": "2.2.38",
    "ajv": "~5.2.2"
  }
}
```
`ReactCrudWebPart.ts`
```

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'ReactCrudWebPartStrings';
import ReactCrud from './components/ReactCrud';
import { IReactCrudProps } from './components/IReactCrudProps';

export interface IReactCrudWebPartProps {
  listName: string;
}

export default class ReactCrudWebPart extends BaseClientSideWebPart<IReactCrudWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IReactCrudProps > = React.createElement(
      ReactCrud,
      {
        listName: this.properties.listName,
        spHttpClient: this.context.spHttpClient,
        siteUrl: this.context.pageContext.web.absoluteUrl
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

```
Please teach me in details.
