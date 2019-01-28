import { CompController } from '../core/mvc/CompController';
import * as MiniSignal from 'mini-signals';
import { Helper } from '../utils/Helper';
import { Asset } from '../utils/Types';
import { CoreState } from '../core/mvc/CoreState';
import { Singleton } from 'tioc-gg';

@Singleton
export class ComponentManager {
    public components: Array<CompController>;
    public componentsFinishedStateSignal: MiniSignal;
    protected _isReadyForNextState: boolean;
    private readyComponents: Array<string>;

    constructor () {
        this.components = new Array<CompController>();
        this.readyComponents = new Array<string>();

        this.componentsFinishedStateSignal = new MiniSignal();

        this._isReadyForNextState = true;
    }

    public addComponent ( component : CompController ) : void {
        component.finishStateActionSignal.add( this.onComponentHandleState, this );
        this.components.push ( component );
    }

    public removeComponent ( component : CompController ) : void {
        component.finishStateActionSignal.detachAll();
        Helper.removeItemsFromArray ( this.components, component );
    }

    get listOfFilesToLoad( ) : Array < Asset > {
        var assetsToLoad : Array < Asset >  = new Array < Asset >();
        this.components.forEach(element => {
            assetsToLoad = assetsToLoad.concat( element.loaderList );
        });

        return assetsToLoad;
    }

    public setState( state : CoreState ) : void {
        console.log( 'current state - ' + state.stateName );
        this._isReadyForNextState = false;
        this.readyComponents = [];

        this.components.forEach( ( element ) => {
            element.setState( state );
        });
    }

    public onComponentHandleState ( componentID : string ) : void {
        if ( this.readyComponents.indexOf ( componentID ) < 0 ) {
            this.readyComponents.push( componentID );
        }

        if ( this.readyComponents.length == this.components.length ) {
            this._isReadyForNextState = true;
            this.componentsFinishedStateSignal.dispatch();
        }
    }
}