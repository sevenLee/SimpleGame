import { Inject, Container} from 'tioc-gg';
import { CompController } from '../../core/mvc/CompController';
import { SimpleTimer } from '../../core/time/SimpleTimer';
import { ReelsView, IReelStripModel, IReelsConfig, IReelStripConfig, IInitData } from './ReelsView';
import { ReelsConfig } from './ReelsConfig';
import { ReelStripModel, SymbolData } from './ReelStripModel';
import { Helper } from '../../utils/Helper';
import { SymbolState } from './ReelsEnums';
import { Viewport } from '../../core/viewport/Viewport';
import { GlobalDispatcher, EventParams } from '../../core/GlobalDispatcher';
import { WinLine } from '../lines/WinLine';

export class ReelsController extends CompController {
    public static readonly SHOW_WIN_LINE_NOTIFICATION : string = 'reelsShowWinLineNotification';

    @Inject
    protected viewport : Viewport;
    protected idleTimer : SimpleTimer;
    protected view			:  ReelsView;
    protected reels					: Array < IReelStripModel >;
    protected componentConfig 		: IReelsConfig;
    protected stripsConfig			: Array < IReelStripConfig >;
    protected activeReelsID			: Array < number >;
    protected activeReelsIndex		: number;
    protected currentSpinningReelsCounter: number;
    protected isFastStopPending: boolean;
    protected fastStopTimeout: boolean;
    protected nextReelStopTimer : SimpleTimer;
    protected normalTimer : SimpleTimer;


    constructor( @Inject view : ReelsView ) {
        super( view );
        console.log('## reels:', this.reels);
    }

    public addEventListeners(): void {
        GlobalDispatcher.addListener(this, ReelsController.SHOW_WIN_LINE_NOTIFICATION, this.onShowWinLine);
    }

    public init (): void {
        let initData : IInitData = {
            balance: 997717500,
            bet: 5000,
            lines : [1],
            strips: [
                ['J', 'A', 'PIC1', 'N', 'J', 'T', 'PIC2', 'A', 'J', 'PIC3', 'Q', 'T', 'A', 'SCATTER', 'N', 'Q', 'PIC1', 'K', 'N', 'PIC4', 'Q', 'N', 'T', 'PIC2', 'Q', 'N', 'T', 'PIC4', 'A', 'Q', 'T', 'PIC4', 'J', 'Q', 'SCATTER', 'T', 'N', 'Q', 'PIC1', 'A', 'K', 'PIC4', 'T', 'N', 'PIC2', 'K', 'Q', 'PIC3', 'T', 'J', 'N', 'PIC4', 'Q', 'PIC3'],
                ['PIC2', 'N', 'PIC4', 'J', 'K', 'PIC3', 'N', 'K', 'PIC1', 'A', 'J', 'PIC2', 'A', 'N', 'PIC3', 'J', 'K', 'PIC4', 'Q', 'N', 'A', 'SCATTER', 'K', 'T', 'PIC4', 'N', 'PIC2', 'K', 'A', 'PIC3', 'J', 'WILD', 'N', 'K', 'PIC3', 'Q', 'J', 'PIC4', 'N', 'J', 'SCATTER', 'J', 'A', 'PIC3', 'K', 'PIC2', 'A', 'T', 'PIC1', 'A', 'K', 'PIC4', 'J', 'N', 'PIC1', 'A'],
                ['PIC4', 'T', 'J', 'WILD', 'Q', 'T', 'SCATTER', 'A', 'PIC4', 'K', 'A', 'Q', 'PIC2', 'T', 'PIC3', 'A', 'PIC4', 'Q', 'K', 'PIC4', 'T', 'PIC3', 'Q', 'K', 'PIC2', 'T', 'K', 'PIC4', 'J', 'T', 'SCATTER', 'N', 'Q', 'PIC3', 'N', 'T', 'PIC2', 'WILD', 'K', 'PIC1', 'J', 'N', 'PIC4', 'Q', 'PIC1', 'T', 'PIC2', 'J', 'T', 'PIC3', 'Q', 'N', 'PIC1', 'Q', 'PIC2', 'K'],
                ['PIC4', 'K', 'PIC2', 'N', 'PIC3', 'A', 'PIC4', 'K', 'PIC2', 'J', 'Q', 'PIC4', 'N', 'PIC2', 'J', 'K', 'WILD', 'N', 'Q', 'SCATTER', 'J', 'PIC3', 'A', 'PIC1', 'N', 'PIC4', 'Q', 'J', 'PIC1', 'Q', 'N', 'PIC3', 'A', 'J', 'PIC2', 'K', 'PIC4', 'J', 'K', 'PIC3', 'N', 'T', 'PIC2', 'J', 'PIC4', 'K', 'PIC3', 'T', 'PIC1', 'Q', 'N', 'SCATTER', 'K', 'PIC2', 'T', 'N', 'PIC3', 'J'],
                ['PIC2', 'A', 'Q', 'PIC4', 'K', 'T', 'PIC1', 'Q', 'J', 'T', 'PIC2', 'Q', 'K', 'N', 'SCATTER', 'T', 'Q', 'J', 'PIC3', 'A', 'T', 'Q', 'A', 'PIC1', 'T', 'N', 'SCATTER', 'J', 'PIC4', 'A', 'T', 'WILD', 'K', 'N', 'PIC4', 'Q', 'T', 'N', 'PIC3', 'K', 'T', 'PIC2', 'A', 'K', 'SCATTER', 'Q', 'PIC3', 'J', 'N', 'A', 'PIC4', 'J', 'Q', 'PIC1', 'K']
            ],
            idleSymbols: [
                ['PIC3', 'Q', 'PIC4'],
                ['A', 'PIC1', 'N'],
                ['K', 'PIC2', 'Q'],
                ['J', 'PIC3', 'N'],
                ['K', 'PIC1', 'Q']
            ]
        };

        this.initReelsConfig();
        this.initViewController();
        this.initReelsModel(initData.strips, initData.idleSymbols);
        this.viewport.resizeStage(window.innerWidth, window.innerHeight);
        window.scrollTo(0, 0);
        this.finishStateAction();
    }

    protected initReelsConfig(): void {
        this.componentConfig = this.gameConfig.getConfig<IReelsConfig>( ReelsConfig );
        this.stripsConfig = this.componentConfig.reels;
        console.log('## ReelsController [initReelsConfig]: this.stripsConfig:', this.stripsConfig);
    }

    protected initViewController(): void {
        this.view.idleAnimationsCompleteSignal.add(this.idleAnimationsComplete, this);

        this.view.initialize( this.componentConfig );
    }

    protected initReelsModel( strips : Array < Array <string> >, idleSymbols : Array < Array <string> > ) : void {
        this.reels = new Array<IReelStripModel>();

        this.activeReelsID = this.getActiveReelsID();
        this.activeReelsIndex = 0;

        for (var i = 0; i < this.stripsConfig.length; i++) {
            this.view.reelsViewInitSymbols(i, this.stripsConfig[i]);
            this.view.reelsOverlayInitSymbols(i, this.stripsConfig[i]);

            var baseReelModel: IReelStripModel = this.createReelStripModel();

            this.addModelListeners(baseReelModel);
            baseReelModel.allStripSymbols = strips[i];
            baseReelModel.symbolsOutcome = idleSymbols[i];
            baseReelModel.setConfig(this.stripsConfig[i]);

            baseReelModel.initReel();
            this.reels.push(baseReelModel);
        }
    }

    protected addModelListeners( baseReelModel : IReelStripModel ) : void {
        baseReelModel.reelStopedSignal.add(this.onReelStoped, this);
        baseReelModel.stopRequestedSignal.add(this.onStopRequested, this);
        baseReelModel.dropAnimationSignal.add(this.onSymbolDropAnimation, this);
        baseReelModel.setSymbolNameSignal.add(this.onSetSymbolNameToView, this);
        baseReelModel.spinTweenUpdateSignal.add(this.onTweenUpdateSymbols, this);
        baseReelModel.moveLastSymbolToTopSignal.add(this.onMoveLastSymbolToTop, this);
    }

    protected onReelStoped(reelId: number): void {
        this.currentSpinningReelsCounter--;
        if (this.currentSpinningReelsCounter == 0) {
            this.finishStateAction();
        } else if (this.currentSpinningReelsCounter == 1) {
            if (!this.isFastStopPending) {
                this.fastStopTimeout = true;
            }
        }3;
    }

    protected onStopRequested(reelId: number): void {
        if (!this.isFastStopPending) {
            if (this.activeReelsIndex < this.activeReelsID.length - 1) {
                this.activeReelsIndex++;
                this.nextReelStopTimer = new SimpleTimer(
                    this.stripsConfig[this.activeReelsID[this.activeReelsIndex]].stopReelNormalDelay,
                    this.stopNextStrip.bind(this) );
            }
        }
    }

    protected onSymbolDropAnimation(reelId: number, symbolId: number): void {
        this.view.symbolDropAnimation(reelId, symbolId);
    }

    protected onSetSymbolNameToView( reelId: number, itemId: number,
        symbolName: string, state: SymbolState ): void {
            this.view.reelSetSymbolName(reelId, itemId, symbolName, state);
    }

    protected onTweenUpdateSymbols(reelId: number, symbolId: number, y: number): void {
        this.view.tweenSymbolsUpdate(reelId, symbolId, y);
    }

    protected onMoveLastSymbolToTop( reelId: number, symbolData: SymbolData, state: SymbolState ): void {
        this.view.moveLastSymbolToTop(reelId, symbolData, state);
    }

    protected stopNextStrip(): void {
        this.reels[ this.activeReelsID [ this.activeReelsIndex ] ].requestStop();
    }

    protected idleAnimationsComplete(): void {
        this.idleTimer = new SimpleTimer( this.componentConfig.idleAnimationDelay, this.playIdleAnimations.bind( this ));
    }

    protected playIdleAnimations () : void {
        this.view.playIdleAnimations( );
    }

    protected getActiveReelsID ( ) : Array < number > {
        return Helper.getFillinArray( 0, this.stripsConfig.length );
    }

    protected createReelStripModel() : IReelStripModel {
        return Container.get(ReelStripModel);
    }

    public baseGameIdle(): void {
        this.view.deleteAllAnimations();
        this.idleTimer = new SimpleTimer( this.componentConfig.idleAnimationDelay, this.playIdleAnimations.bind( this ));
        this.finishStateAction();
    }

    public startSpin(): void {
        this.resetReels();
        this.activeReelsID = this.getActiveReelsID();
        this.startReels( this.activeReelsID );
        this.finishStateAction();
    }

    protected resetReels() : void {
        this.isFastStopPending = false;
        this.fastStopTimeout = false;
        this.view.deleteAllAnimations();
        this.view.setSymbolsStateForAll( SymbolState.STATIC );
        if (this.idleTimer != null) {
            this.idleTimer.stop();
        }
        if (this.normalTimer != null) {
            this.normalTimer.stop();
        }
    }

    protected startReels( reelsId : Array < number > ): void {
        this.currentSpinningReelsCounter = reelsId.length;
        for (var i = 0; i < this.currentSpinningReelsCounter; i ++) {
            this.reels[reelsId[i]].startSpinning();
        }
    }

    public spinStop( stateData : any ): void {
        for (var i: number = 0; i < this.reels.length; i++) {
            this.reels[i].symbolsOutcome = stateData.reelIndexes[i];
        }
        this.activeReelsIndex = 0;
        this.stopNextStrip();
    }

    protected onShowWinLine(e: EventParams): void {
        let winLine : WinLine = e.data;
        let loseSymbolPositions : Array < Array <number> > = [[]];

        for (let i = 0; i < this.stripsConfig.length; i++) {
            loseSymbolPositions[i] = [];
            for (let j = 0; j < this.stripsConfig[i].symbolsOnReel; j++) {
                if ( winLine.reelPositions[i] != j ) {
                    loseSymbolPositions[i].push( j );
                }
            }
        }

        this.view.showWinLine(winLine, loseSymbolPositions);

        this.view.setSymbolStateForPositions( loseSymbolPositions, SymbolState.LOSE );
    }
}