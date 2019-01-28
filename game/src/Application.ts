import * as PIXI from 'pixi.js';
import { PreloaderController } from './core/preloader/PreloaderController';
import { TweenJSTickConsumer } from './core/time/TweenJSTickConsumer';
import { ComponentManager } from './components/ComponentManager';
import { CompController, Component } from './core/mvc/CompController';
import { HeartTicker } from './core/time/HeartTicker';
import { Viewport } from './core/viewport/Viewport';
import { Container, Inject } from 'tioc-gg';
import { BackgroundController } from './components/background/BackgroundController';
import { SpinPanelController } from './components/spinPanel/SpinPanelController';
import { FPSMeterController } from './components/fpsmeter/FPSMeterController';
import { ReelsController } from './components/reels/ReelsController';
import { MockServer } from './core/server/MockServer';
import { BaseWinLinesController } from './components/lines/BaseWinLinesController';

export class Application {
    @Inject
    protected viewport : Viewport;

    @Inject
    protected timeManager: HeartTicker;

    @Inject
    protected componentManager : ComponentManager;
    protected preloader : PreloaderController;
    public pixi: PIXI.Application;

    constructor () {
        this.pixi = new PIXI.Application();
        this.pixi.renderer.view.id = 'gameCanvas';
        this.setup();
        this.addComponents();
        this.createPreloader();
        this.preloader.loadPreloaderAssets();

        window.onresize = this.onResizeWindow.bind(this);
        this.resizeStage(window.innerWidth, window.innerHeight);
    }

    protected onResizeWindow ( ) : void {
        this.resizeStage(window.innerWidth, window.innerHeight);
        window.scrollTo(0, 0);
    }

    protected setup(): void {
        this.timeManager.register( new TweenJSTickConsumer() );
        this.viewport.init( this.pixi.stage, this.pixi.renderer );
    }

    protected addComponents () {
        let components : Array<Component> = [
            {id: 'background', class: BackgroundController},
            {id: 'mockServer', class: MockServer},
            {id: 'reel', class: ReelsController},
            {id: 'lines', class: BaseWinLinesController},
            {id: 'spinPanel', class: SpinPanelController},
            {id: 'fpsMeter', class: FPSMeterController}
        ];

        components.forEach((component : Component ) => {
            let comp = Container.get(component.class);
            comp.componentID = component.id;
            this.componentManager.addComponent(comp);
        });
    }

    protected initComponents() {
        this.componentManager.components.forEach((ctrl: CompController) => {
            ctrl.init();
        });
    }

    protected createPreloader() {
        this.preloader = Container.get( PreloaderController );
        this.preloader.loadingFinishedSignal.add(this.onPreloadingDone, this);
        this.preloader.setAssetsForLoading( this.componentManager.listOfFilesToLoad );
    }

    protected onPreloadingDone() : void {
        this.initComponents();
    }

    public resizeStage( innerWidth : number, innerHeight : number ) : void {
        this.viewport.resizeStage(innerWidth, innerHeight);
    }
}
