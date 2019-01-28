import { GameConfig } from '../GameConfig';
import * as MiniSignal from 'mini-signals';
import { Asset } from '../../utils/Types';
import { CompView } from './CompView';
import { Inject } from 'tioc-gg';
import { CoreState } from './CoreState';


export class CompController {

    @Inject
    protected gameConfig : GameConfig;

    public componentID 	: string;

    protected view 		: CompView;

    public isStateActionCompleted : boolean;

    public finishStateActionSignal : MiniSignal;

    constructor ( view? : CompView ) {

        this.isStateActionCompleted = false;

        this.finishStateActionSignal = new MiniSignal();

        if ( view != undefined ) {
            this.view = view;
        }

        this.addEventListeners();
    }

    public init () {
        console.log('## CompController state [init]');

        if ( this.view != undefined ) {
            this.view.initialize();
        }
        this.finishStateAction();
    }

    public get loaderList() : Array < Asset > {
        var assetsList 	: Array < Asset > 	= new Array < Asset > ();
        var config 		: Asset				= this.getConfigAsset();

        if ( this.view != undefined ) {
            assetsList = this.view.getAssetsList();
        }

        if ( config.assetKey != undefined ) {
            assetsList.push( config );
        }

        return assetsList;
    }

    public getConfigAsset() : Asset {
        return {};
    }

    public addEventListeners(): void {
        // do something
    }

    public setState ( state : CoreState ) : boolean {
        if ( typeof this[state.stateName] === 'function' ) {
            this.isStateActionCompleted = false;
            this.invokeStateMethod ( state );
            return true;
        } else {
            this.finishStateAction();
            return false;
        }
    }

    public invokeStateMethod ( state : CoreState ) : void {
        if ( typeof this[state.stateName] === 'function' ) {
            this[ state.stateName ]( state.stateData );
        }
    }

    protected finishStateAction() : void {
        this.isStateActionCompleted = true;
        this.finishStateActionSignal.dispatch ( this.componentID );
    }
}

export type Component = {
    id : string,
    class : Function
};
