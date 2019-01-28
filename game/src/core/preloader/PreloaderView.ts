import { CompView } from '../mvc/CompView';
import { ViewportAlign } from '../viewport/Viewport';

export class PreloaderView extends CompView {
    public preloaderBarURL: string = 'assets/preloader/preloaderBarDesktop.png';
    protected preloadBar: PIXI.Sprite;
    protected preloadBackground: PIXI.Sprite;

    public getAssetsList () {
        return [
            { 	assetKey : 	'preloaderBarURL',
                assetURL :	'assets/preloader/preloaderBarDesktop.png'
            }
        ];
    }

    public showPreloader(): void {
        this.preloadBar = PIXI.Sprite.fromImage('preloaderBarURL');
        this.preloadBar.anchor.set(0, 0.5);
        this.preloadBar.position = this.viewport.getAlignedPoint( ViewportAlign.CENTER_MIDDLE );
        this.preloadBar.scale.x = 0;
        this.viewport.addChild ( this.preloadBar );
    }

    public setProgress ( progress : number ) : void {
        if ( this.preloadBar != undefined ) {
            this.preloadBar.scale.x = progress;
        }
    }

    public destroy ( ) : void {
        this.preloadBar.visible = false;
        this.viewport.removeChild( this.preloadBackground );
        this.viewport.removeChild( this.preloadBar );

        super.destroy();
    }
}