
import { IWinLinesConfig } from './IWinLinesConfig';
import { ReelsView } from '../reels/ReelsView';
import { ReelsController } from '../reels/ReelsController';
import { WinLine } from './WinLine';
import { WinLinesConfig } from './WinLinesConfig';
import { CompController } from '../../core/mvc/CompController';
import { SimpleTimer } from '../../core/time/SimpleTimer';
import { GlobalDispatcher } from '../../core/GlobalDispatcher';
import { StateStore } from '../../core/mvc/StateStore';
import { Inject } from 'tioc-gg';

export class BaseWinLinesController extends CompController {
    @Inject
    protected store : StateStore;
    public static readonly SHOW_WIN_LINE_LOOP_COMPLETE : string = 'showWinLineLoopComplete';

    protected loopedShow : boolean;
    protected showComplete : boolean;
    protected currentWinLineIndex : number;
    protected showLinesStopped : boolean;
    protected winLines : Array<WinLine>;

    protected delayAnimationTimer : SimpleTimer;
    private config: IWinLinesConfig;

    constructor() {
        super();
    }

    public addEventListeners() : void {
        GlobalDispatcher.addListener( this, ReelsView.ALL_SYMBOLS_ANIMATION_COMPLETE,
                                                                                    this.onCombinationAnimateComplete);
        GlobalDispatcher.addListener( this, BaseWinLinesController.SHOW_WIN_LINE_LOOP_COMPLETE,
                                                                                        this.showWinningLoopComplete);
    }

    public init () : void {
        this.initWinLinesConfig();
        this.finishStateAction();
    }

    public baseGameIdle(): void {
        this.reset();
        this.finishStateAction();
    }

    public freeSpinsIdle(): void {
        this.reset();
        this.finishStateAction();
    }

    public startSpin( ) : void {
        this.reset();
        this.finishStateAction();
    }

    public showWinning( data : any ): void {
        this.winLines = data.winLines;
        this.showLinesStopped = false;
        this.showComplete = false;
        this.loopedShow = false;
        this.showWinLine();
    }

    public skip_showWinning( data : any ): void {
        this.reset();
        this.finishStateAction();
    }

    public freeSpinsShowWinning(data: any) {
        this.showWinning(data);
    }

    public skip_freeSpinsShowWinning(data: any) {
        this.reset();
        this.finishStateAction();
    }

    public showWinningLoop( data : any ): void {
        this.winLines = data.winLines;
        // this.delayAnimationTimer.stop();
        this.showLinesStopped = false;
        this.showComplete = true;
        this.loopedShow = true;
        this.showWinLine();
    }

    public skip_showWinningLoop( data : any ): void {
        this.showWinningLoopComplete();
    }

    protected showWinningLoopComplete(): void {
        this.reset();
        this.finishStateAction();
    }

    protected reset(): void {
        this.winLines = [];
        this.showLinesStopped = true;
        this.loopedShow = false;
        this.showComplete = false;
        if (this.delayAnimationTimer != null) {
            this.delayAnimationTimer.stop();
        }
    }

    protected initWinLinesConfig(): void {
        this.config = this.gameConfig.getConfig < IWinLinesConfig > ( WinLinesConfig );
    }

    protected onCombinationAnimateComplete() : void {
        if (!this.showLinesStopped) {
            let deltaMS : number = this.loopedShow ? this.config.winLineLoopAnimationDelay : this.config.winLineAnimationDelay;
            this.delayAnimationTimer = new SimpleTimer( deltaMS, this.showWinLine.bind( this, ++this.currentWinLineIndex));
        }
    }

    protected showWinLine( id : number = 0 ) : void {

        if (this.showLinesStopped || this.winLines == null) {
            return;
        }

        this.currentWinLineIndex = id;
        if (this.currentWinLineIndex >= this.winLines.length) {
            this.currentWinLineIndex = 0;
            this.loopedShow = true;
        }

        var winData : WinLine = this.winLines[this.currentWinLineIndex];
        if (this.loopedShow) {
            if (this.showComplete) {
                this.dispatchWinLine( winData, !this.loopedShow, [this.store.showWinningLoop]);
            } else {
                this.showComplete = true;
                this.finishStateAction();
            }
        } else {
            this.dispatchWinLine( winData, !this.loopedShow, [this.store.showWinning]);
        }
    }

    protected dispatchWinLine( winData : WinLine, showPaylineLabel : boolean, states : Array< string > ) {
        GlobalDispatcher.dispatchIntoExpectedStates(ReelsController.SHOW_WIN_LINE_NOTIFICATION,
            states, winData);
    }
}