import { Viewport } from '../viewport/Viewport';
import { Asset } from '../../utils/Types';
import { Inject } from 'tioc-gg';

export class CompView {
    @Inject
    protected viewport : Viewport;
    protected mainContainer : PIXI.Container;
    public getAssetsList ( ) : Array < Asset > {
        return [];
    }

    public initialize(config?: any): void {
        this.mainContainer = new PIXI.Container();
        this.viewport.addChild( this.mainContainer );
        this.viewport.onResizeSignal.add( this.layoutElements, this );
        this.viewport.onOrientationSignal.add( this.layoutElements, this );

        this.setMainContainerName( config );
        this.createElements( config );
        this.layoutElements();
    }

    protected setMainContainerName(config?: any): void {
        if ( config != null && config.name != null ) {
            this.mainContainer.name = config.name;
        } else {
            this.mainContainer.name = this.constructor.toString().match(/([a-zA-Z_{1}][a-zA-Z0-9_]+)(?=\()/g)[0];
        }
    }

    protected createElements( config? : any ) : void {
        //
    }

    protected layoutElements() : void {
        if ( this.viewport.isPortraitMode ) {
            this.portraitLayout();
        } else {
            this.landscapeLayout();
        }
    }

    public portraitLayout() : void {
        //Example: 	this.backgroundTest.position.set( 0, 100 );
    }

    public landscapeLayout() : void {
        //Example: 	this.backgroundTest.position.set( 200, 200 );
    }

    public addChild< T extends PIXI.DisplayObject >( child : T ) : T {
        return this.mainContainer.addChild( child );
    }

    public addChildAt< T extends PIXI.DisplayObject >( child : T, index : number ) : T {
        return this.mainContainer.addChildAt( child, index );
    }

    public removeChild ( child : PIXI.DisplayObject ) : PIXI.DisplayObject {
        return this.mainContainer.removeChild( child );
    }

    set visible(value: boolean) {
        this.mainContainer.visible = value;
    }

    public destroy ( ) : void {
        this.viewport = undefined;
        this.mainContainer = undefined;
    }
}

export interface ICompViewConfig {
    name: string;
}