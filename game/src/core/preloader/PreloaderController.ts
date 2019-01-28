import { PreloaderView } from './PreloaderView';
import * as MiniSignal from 'mini-signals';
import { Asset } from '../../utils/Types';
import { Inject, Container } from 'tioc-gg';
import * as PIXI from 'pixi.js';

export class PreloaderController {
    protected loader: PIXI.loaders.Loader;
    protected preloaderView: PreloaderView;
    protected filesToLoad: Array<Asset>;
    public loadingFinishedSignal: MiniSignal;
    private loadCount: number = 0;
    private totalResourcesNumber: number = 0;
    private progress: number = 0;

    constructor() {
        this.preloaderView = Container.get( PreloaderView );
        this.loadingFinishedSignal =  new MiniSignal();
        this.loader = PIXI.loader;
    }

    public setAssetsForLoading( pFilesToLoad : Array < Asset > ) : void {
        this.filesToLoad = pFilesToLoad;
    }

    public loadPreloaderAssets() : void {
        this.preloaderView.getAssetsList().forEach( (element : Asset ) => {
            this.loader.add( element.assetKey , element.assetURL );
        });

        this.loader.onComplete.add( () => { this.showPreloader(); } );
        this.loader.load();
    }

    protected showPreloader() : void {
        this.loader.onComplete.detachAll();

        this.preloaderView.showPreloader();

        this.loadConfigFiles();
    }

    protected loadConfigFiles() : void {
        this.loader.onComplete.detachAll();
        this.loader.reset();

        this.loader.onComplete.add( () => {
            this.loader.onComplete.detachAll();
            this.loadAssets();
        } );
        this.loader.load();
    }

    protected loadAssets() : void {
        this.loader.reset();
        this.filesToLoad.forEach( (element : Asset ) => {
            if ( this.loader.resources[element.assetKey] == undefined ) {
                this.loader.add( element.assetKey , element.assetURL );
            } else {
                console.warn( 'Resource named' + element.assetKey + ' already exists. ');
            }
        });

        this.totalResourcesNumber = this.calculateResourceNumber();

        this.loader.onProgress.add ( ( data, resource ) => { this.onProgress( resource ); } );
        this.loader.load();
    }

    private onProgress(resource: any): void {
        this.loadCount++;
        this.totalResourcesNumber = this.calculateResourceNumber();
        this.progress = Math.max( this.progress, this.loadCount / this.totalResourcesNumber );
        this.preloaderView.setProgress ( this.progress );

        if ( this.loadCount == this.totalResourcesNumber ) {
            this.loadingFinishedSignal.dispatch();
        }
    }

    private calculateResourceNumber ( ) : number {
        return Object.keys ( this.loader.resources ).length ;
    }

    public destroy() : void {
        PIXI.loader.onComplete.detachAll();
        this.loadingFinishedSignal.detachAll();
        this.loadingFinishedSignal = null;
        this.preloaderView.destroy();
    }
}