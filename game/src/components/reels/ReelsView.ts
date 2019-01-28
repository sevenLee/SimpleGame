import { Sprite, Graphics } from 'pixi.js';
import { CompView } from '../../core/mvc/CompView';
import {Asset} from '../../utils/Types';
import * as MiniSignal from 'mini-signals';
import { SymbolAnimationPostfix, SymbolState } from './ReelsEnums';
import { Container, Inject } from 'tioc-gg';
import { ReelStripView } from './ReelStripView';
import { ReelStripOverlay } from './ReelStripOverlay';
import { ViewportAlign } from '../../core/viewport/Viewport';
import { GlobalDispatcher } from '../../core/GlobalDispatcher';
import { StateStore } from '../../core/mvc/StateStore';
import { WinLine } from '../lines/WinLine';
import { SimpleTimer } from '../../core/time/SimpleTimer';



export interface IGameElement {
    assetName?: string;
    x: number;
    y: number;
}

export interface IInitData {
    balance : number;
    bet : number;
    lines : Array<number>;
    idleSymbols : Array<Array<string>>;
    strips : Array<Array<string>>;
}

export interface IReelStripModel {
    id							: number;
    symbolsOutcome				: Array < string >;
    allStripSymbols				: Array < string >;

    setSymbolNameSignal			: MiniSignal;
    moveLastSymbolToTopSignal	: MiniSignal;
    reelStopedSignal			: MiniSignal;
    stopRequestedSignal			: MiniSignal;
    spinTweenUpdateSignal		: MiniSignal;
    dropAnimationSignal			: MiniSignal;

    initReel()							: void;
    requestStop()						: void;
    tweenComplete()						: void;
    startSpinning()						: void;
    setConfig(config: IReelStripConfig)	: void;
}

export interface IReelsConfig {
    name: string;
    idleAnimationDelay: number;
    reelStopNormalTime: number;
    reels: IReelStripConfig[];
    reelBackground?: IGameElement;
    reelsFrames?: IGameElement[];

    portraitPositionX : number;
    portraitPositionY : number;
    portraitScale : number;
}

export interface IReelStripConfig {
    landscapeX: number;
    landscapeY: number;
    width: number;
    symbol: ISymbolConfig;
    id: number;
    rangeSymbols: Array<string>;
    dropSymbols: Array<string>;
    symbolsOnReel: number;
    reelTween: any;
    stopTween: any;
    startReelDelay: number;
    stopReelNormalDelay: number;
}

export interface ISymbolConfig {
    width: number;
    height: number;
}

export class SymbolData {
    public symbolName: string;
    public posY: number;
    constructor(symbolName: string, posY: number) {
        this.symbolName = symbolName;
        this.posY = posY;
    }
}

export interface IReelStripView {
    symbolAnimationCompleteSignal: MiniSignal;
    setId(id: number): void;
    setContainer(stripContainer: PIXI.Container): void;
    deleteSymbolsAnimation(): void;
    symbolsInit(e: IReelStripConfig): void;
    tweenSymbolsUpdate( symbolId: number, y: number): void;
    playSymbolAnimation(symbolId: number, typeAnim: string): void;
    hideSymbol(symbolId: number): void;
    showSymbol(symbolId: number): void;
    setSymbolNameWithState(symbolId: number, symbolName: string, state: SymbolState): void;
    setSymbolState(symbolId: number, state: SymbolState): void;
    moveLastSymbolToTop( symbolData: SymbolData, state: SymbolState): void;
}

export class ReelsView extends CompView {
    public static readonly ALL_SYMBOLS_ANIMATION_COMPLETE: string = 'allSymbolsAnimationComplete';

    @Inject
    protected store : StateStore;

    protected completedAnimationCounter: number = 0;
    protected stripsConfig: Array < IReelStripConfig >;
    protected reelConfig: IReelsConfig​​;
    protected reelsView: Array < IReelStripView  >;
    protected reelsOverlay: Array < IReelStripView  >;
    protected reelBackground: Sprite;
    protected reelsViewContainer: PIXI.Container;
    protected reelsOverlayContainer: PIXI.Container;

    public idleAnimationsCompleteSignal: MiniSignal;

    constructor() {
        super();
        this.idleAnimationsCompleteSignal = new MiniSignal();
    }

    public createElements( reelConfig : IReelsConfig ): void {
        this.stripsConfig = reelConfig.reels;
        this.reelConfig = reelConfig;
        this.initReelsBackground();
        this.initReelsView();
        this.initReelsOverlay();
    }

    public getAssetsList( ) :  Array < Asset > {
        return [
            {
                assetKey :  'symbols',
                assetURL : 	'assets/symbols/symbols.json'
            },
            { 	assetKey :  'symbolAnimationA_J_K_N_P2_SCA',
                assetURL : 	'assets/symbols/symbolAnimationA_J_K_N_P2_SCA.json'
            },
            { 	assetKey :  'symbolAnimationP1',
                assetURL : 	'assets/symbols/symbolAnimationP1.json'
            },
            { 	assetKey :  'symbolAnimationP3_P4_Q_T_W',
                assetURL : 	'assets/symbols/symbolAnimationP3_P4_Q_T_W.json'
            },
        ];
    }

    public portraitLayout( ) {
        super.portraitLayout();

        this.reelsViewContainer.position.x = this.reelConfig.portraitPositionX;
        this.reelsViewContainer.position.y = this.reelConfig.portraitPositionY;
        this.reelsViewContainer.scale.set( this.reelConfig.portraitScale, this.reelConfig.portraitScale );

        this.reelsOverlayContainer.position.x = this.reelsViewContainer.position.x;
        this.reelsOverlayContainer.position.y = this.reelsViewContainer.position.y;
        this.reelsOverlayContainer.scale.set( this.reelsViewContainer.scale.x, this.reelsViewContainer.scale.y );

    }

    public landscapeLayout() {
        super.landscapeLayout();
        const offsetY: number = 100;
        this.reelsViewContainer.scale.set( 1, 1 );
        this.reelsViewContainer.x = this.viewport.getAlignedPoint( ViewportAlign.CENTER_MIDDLE ).x - this.reelsViewContainer.width / 2;
        this.reelsViewContainer.y = 0 - this.reelsViewContainer.height / 2 - offsetY;
        this.reelsViewContainer.scale.set( this.reelConfig.portraitScale, this.reelConfig.portraitScale );
        console.log('this.viewport.getAlignedPoint( ViewportAlign.CENTER_MIDDLE ).x :', this.viewport.getAlignedPoint( ViewportAlign.CENTER_MIDDLE ).x );
        console.log('this.reelsViewContainer.width / 2:', this.reelsViewContainer.width / 2);
        console.log('this.reelsViewContainer.position.x:', this.reelsViewContainer.position.x);
        this.reelsOverlayContainer.position.x = this.reelsViewContainer.x;
        this.reelsOverlayContainer.position.y = this.reelsViewContainer.position.y;
        this.reelsOverlayContainer.scale.set( this.reelsViewContainer.scale.x, this.reelsViewContainer.scale.y );

    }

    protected initReelsBackground() : void  {
        if ( this.reelConfig.reelBackground != null ) {
            this.reelBackground = PIXI.Sprite.fromFrame( this.reelConfig.reelBackground.assetName );
            this.reelBackground.position.set( this.reelConfig.reelBackground.x, this.reelConfig.reelBackground.y );
            this.addChild( this.reelBackground );
        }
    }

    protected initReelsView(): void {
        console.log('initReelsView:');

        this.reelsViewContainer = new PIXI.Container();
        this.reelsView = new Array < IReelStripView >();
        for (let i = 0; i < this.stripsConfig.length; i++) {
            let reelConfig : IReelStripConfig = this.stripsConfig[i];

            let reelContainer: PIXI.Container = new PIXI.Container();
            reelContainer.position.x = reelConfig.landscapeX;
            reelContainer.position.y = reelConfig.landscapeY;

            let reelMask : Graphics = this.getReelMask(
                reelConfig.landscapeX,
                reelConfig.landscapeY,
                reelConfig.width,
                reelConfig.symbol.height * reelConfig.symbolsOnReel
            );

            this.reelsViewContainer.addChild(reelMask);
            this.reelsViewContainer.addChild(reelContainer);

            reelContainer.mask = reelMask;

            let baseReelView: IReelStripView = this.createReelStripView();
            baseReelView.setContainer(reelContainer);
            baseReelView.setId(i);
            this.reelsView.push( baseReelView );
        }
        console.log('[addChild] this.reelsViewContainer.position.x:', this.reelsViewContainer.position.x);

        this.addChild(this.reelsViewContainer);
    }

    protected createReelStripView(): IReelStripView {
        return Container.get(ReelStripView);
    }

    protected createReelStripOverlay(): IReelStripView {
        return Container.get(ReelStripOverlay);
    }

    protected initReelsOverlay(): void {
        this.reelsOverlayContainer = new PIXI.Container();
        this.reelsOverlay = new Array < IReelStripView >();
        for (let i = 0; i < this.stripsConfig.length; i++) {
            let reelConfig : IReelStripConfig = this.stripsConfig[i];

            let reelContainer: PIXI.Container = new PIXI.Container();
            reelContainer.position.x = reelConfig.landscapeX;
            reelContainer.position.y = reelConfig.landscapeY;

            this.reelsOverlayContainer.addChild(reelContainer);

            let baseReelView: IReelStripView = this.createReelStripOverlay();
            baseReelView.setContainer(reelContainer);
            baseReelView.setId(i);
            this.reelsOverlay.push( baseReelView );
        }

        let reelMask : Graphics = this.getReelMask(
            this.stripsConfig[0].landscapeX,
            this.stripsConfig[0].landscapeY,
            this.stripsConfig[this.stripsConfig.length - 1].landscapeX + this.stripsConfig[this.stripsConfig.length - 1].width - this.stripsConfig[0].landscapeX,
            this.stripsConfig[0].symbol.height * this.stripsConfig[0].symbolsOnReel
        );

        this.reelsOverlayContainer.addChild(reelMask);
        this.reelsOverlayContainer.mask = reelMask;
        this.addChild(this.reelsOverlayContainer);
    }

    protected getReelMask ( x : number, y : number, width : number, height : number ) : PIXI.Graphics {
        var reelMask: Graphics = new Graphics();
        reelMask.beginFill(0x000000, 1);
        reelMask.drawRect(0, 0, width, height );
        reelMask.endFill();
        reelMask.position.x = x;
        reelMask.position.y = y;

        return reelMask;
    }

    public reelsViewInitSymbols( reelId: number, config: IReelStripConfig ): void {
        this.reelsView[ reelId ].symbolsInit( config );
    }

    public reelsOverlayInitSymbols( reelId: number, config: IReelStripConfig ): void {
        this.reelsOverlay[ reelId ].symbolsInit( config );
        this.reelsOverlay[ reelId ].symbolAnimationCompleteSignal.add(this.onSymbolAnimationComplete, this);
    }

    public symbolDropAnimation(reelId: number, symbolId: number): void {
        if (this.reelsOverlay[reelId].playSymbolAnimation(symbolId, SymbolAnimationPostfix.DROPPED)) {
            this.reelsView[reelId].hideSymbol(symbolId);
            this.reelsOverlay[reelId].showSymbol(symbolId);
        }
    }

    public reelSetSymbolName( reelId: number, itemId: number, symbolName: string, state: SymbolState ): void {
        this.reelsView[ reelId ].setSymbolNameWithState( itemId, symbolName, state );
        this.reelsOverlay[ reelId ].setSymbolNameWithState( itemId, symbolName, state );
    }

    public tweenSymbolsUpdate( reelId: number, symbolId: number, y: number): void {
        this.reelsView[ reelId ].tweenSymbolsUpdate( symbolId, y );
        this.reelsOverlay[ reelId ].tweenSymbolsUpdate( symbolId, y );
    }

    public moveLastSymbolToTop( reelId: number, symbolData: SymbolData, state: SymbolState ): void {
        this.reelsView[ reelId ].moveLastSymbolToTop( symbolData, state );
        this.reelsOverlay[ reelId ].moveLastSymbolToTop( symbolData, state );
    }

    public playIdleAnimations(): void {
        this.deleteAllAnimations();
        for (var i = 0; i < this.stripsConfig.length; i++) {
            for (var j = 1; j <= this.stripsConfig[i].symbolsOnReel; j++) {
                if ( this.reelsOverlay[i].playSymbolAnimation(j, SymbolAnimationPostfix.IDLE )) {
                    this.reelsView[i].hideSymbol(j);
                    this.reelsOverlay[i].showSymbol(j);
                    this.completedAnimationCounter++;
                }
            }
        }
    }

    public deleteAllAnimations(): void {
        this.completedAnimationCounter = 0;
        for (var i = 0; i < this.stripsConfig.length; i++) {
            for (var j = 0; j < this.stripsConfig[i].symbolsOnReel; j++) {
                this.reelsView[i].showSymbol(j);
            }
            this.reelsOverlay[i].deleteSymbolsAnimation();
        }
    }

    public setSymbolsStateForAll( state : SymbolState ) : void {
        for (let i = 0; i < this.stripsConfig.length; i++) {
            for (let j = 1; j <= this.stripsConfig[i].symbolsOnReel; j++) {
                this.reelsView[i].setSymbolState( j, state );
                this.reelsOverlay[i].setSymbolState( j, state );
            }
        }
    }

    protected onSymbolAnimationComplete( reelId: number, symbolId: number, type: string): void {
        this.reelsOverlay[reelId].hideSymbol(symbolId);
        this.reelsView[reelId].showSymbol(symbolId);
        if (type != SymbolAnimationPostfix.DROPPED) {
            this.completedAnimationCounter--;
            if (this.completedAnimationCounter == 0) {
                if (type == SymbolAnimationPostfix.WIN) {
                    this.dispatchAllSymbolsAnimationComplete();
                } else if (type == SymbolAnimationPostfix.IDLE) {
                    this.idleAnimationsCompleteSignal.dispatch();
                }
            }
        }
    }

    public showWinLine(winItemsData: WinLine, loseSymbolsPosition? : Array< Array <number> >): void {
        this.deleteAllAnimations();
        let countTopExtraSymbol: number = 1;
        for (var i = 0; i < winItemsData.winningCombination.length; i++) {
            let symbolId: number = winItemsData.reelPositions[i] + countTopExtraSymbol;
            if (this.reelsOverlay[i].playSymbolAnimation(symbolId, SymbolAnimationPostfix.WIN)) {
                this.reelsView[i].hideSymbol(symbolId);
                this.reelsOverlay[i].showSymbol(symbolId);
                this.completedAnimationCounter++;
            }
        }

    }

    public setSymbolStateForPositions( reelPositions : Array< Array<number> >, state : SymbolState ) : void {
        if ( reelPositions.length == this.reelsView.length ) {
            for (let i = 0; i < reelPositions.length; i++) {
                for (let j = 0; j < reelPositions[i].length; j++) {
                    this.reelsView[i].setSymbolState( reelPositions[i][j] + 1, state );
                    this.reelsOverlay[i].setSymbolState( reelPositions[i][j] + 1, state );
                }
            }
        }
    }

    protected dispatchAllSymbolsAnimationComplete(): void {
        GlobalDispatcher.dispatchIntoExpectedStates(
            ReelsView.ALL_SYMBOLS_ANIMATION_COMPLETE, [
                this.store.showWinning,
                this.store.showWinningLoop
            ]);
    }
}