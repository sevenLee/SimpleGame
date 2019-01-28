import * as PIXI from 'pixi.js';
import { spine } from 'pixi.js';
import { ViewportAlign } from '../../core/viewport/Viewport';
import { IBackgroundConfig } from './IBackgroundConfig';
import { CompView } from '../../core/mvc/CompView';
import { Asset } from '../../utils/Types';

export class BackgroundView extends CompView {
    protected gameBackground : spine.Spine;
    protected fillBackground : PIXI.Sprite;
    protected config : IBackgroundConfig;
    protected mask : PIXI.Graphics;
    public getAssetsList() :  Array < Asset > {
        return [
            { 	assetKey :  'background_portrait',
                assetURL : 	'assets/background/Base_Portrait.png'
            },
            {
                assetKey 	: 'background_landscape',
                assetURL	: 'assets/background/Base_Landscape.png'
            },
        ];
    }

    public initialize( config : IBackgroundConfig ) {
        super.initialize( config );
    }

    public createElements(config?: IBackgroundConfig ) {
        super.createElements(config);
        this.config = config;
        this.fillBackground = PIXI.Sprite.fromFrame( this.config.landscapeBackground );
        this.fillBackground.anchor.set( 0.5, 0 );
        this.fillBackground.position.set( this.viewport.getAlignedPoint( ViewportAlign.CENTER_MIDDLE ).x, 0 );
        this.addChild( this.fillBackground );
    }

    public portraitLayout() : void {
        this.fillBackground.texture = PIXI.Sprite.fromImage('background_portrait').texture;
        this.fillBackground.position.set( this.viewport.getAlignedPoint( ViewportAlign.CENTER_MIDDLE ).x, 0 );
    }

    public landscapeLayout() : void {
        this.fillBackground.texture = PIXI.Sprite.fromImage('background_landscape').texture;
        this.fillBackground.position.set( this.viewport.getAlignedPoint( ViewportAlign.CENTER_MIDDLE ).x, 0 );
    }
}
