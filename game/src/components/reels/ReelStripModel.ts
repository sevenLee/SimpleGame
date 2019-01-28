import {SimpleTween} from '../../core/time/SimpleTween';
import { SimpleTimer } from '../../core/time/SimpleTimer';
import { IReelStripModel, IReelStripConfig } from './ReelsView';
import { NMath } from '../../utils/NMath';

import { SymbolState } from './ReelsEnums';
import * as MiniSignal from 'mini-signals';
import * as TWEEN from '@tweenjs/tween.js';

export class ReelStripModel implements IReelStripModel {

    protected readonly countTopExtraSymbol: number = 1;
    protected readonly countBottomExtraSymbol: number = 1;
    
    public symbolsOutcome: Array<string>;

    public allStripSymbols: Array<string>;

    protected _id : number;

    protected reelSymbols: Array < SymbolData >;

    protected config: IReelStripConfig;

    protected reelsStripIndex: number;

    protected outcomeSymbolsCounter: number;

    protected totalStageSymbolsCount: number;

    protected stopRequested: boolean;

    public setSymbolNameSignal: MiniSignal;

    public spinTweenUpdateSignal: MiniSignal;

    public moveLastSymbolToTopSignal: MiniSignal;

    public reelStopedSignal: MiniSignal;

    public stopRequestedSignal: MiniSignal;

    public dropAnimationSignal: MiniSignal;

    get id(): number {
        return this._id;
    }

    constructor() {
        this.setSymbolNameSignal 		= new MiniSignal();
        this.moveLastSymbolToTopSignal 	= new MiniSignal();
        this.reelStopedSignal			= new MiniSignal();
        this.stopRequestedSignal 		= new MiniSignal();
        this.spinTweenUpdateSignal 		= new MiniSignal();
        this.dropAnimationSignal 		= new MiniSignal();

        this.reelsStripIndex 			= 0;
        this.outcomeSymbolsCounter 		= 0;
    }

    public setConfig(config: IReelStripConfig): void {
        this._id 						= config.id;
        this.config 					= config;
        this.totalStageSymbolsCount 	= this.countTopExtraSymbol + this.config.symbolsOnReel + this.countBottomExtraSymbol;
    }

    public initReel(): void {
        this.reelSymbols = new Array<SymbolData>();
        let name: string = 'none';
        for (var i = 0; i < this.totalStageSymbolsCount; i++) {
            if (i > 0 && i <= this.config.symbolsOnReel) {
                name = this.symbolsOutcome[i - this.countTopExtraSymbol];
                console.log('## ReelStripModel [initReel] name:', name);
            } else {
                name = this.nextSymbol();
            }
            this.setSymbolNameSignal.dispatch(this.id, i, name, SymbolState.STATIC);
            this.reelSymbols.push(new SymbolData(name, i * this.config.symbol.height - this.config.symbol.height));
        }
    }

    protected nextSymbol(): string {
        if (this.allStripSymbols && this.allStripSymbols.length > 0) {
            this.reelsStripIndex++;
            if (this.reelsStripIndex >= this.allStripSymbols.length - 1) {
                this.reelsStripIndex = 0;
            }
            return this.allStripSymbols[this.reelsStripIndex];
        }

        return this.config.rangeSymbols[NMath.randomInt(0, this.config.rangeSymbols.length - 1)];
    }

    public startSpinning(): void {
        console.log('## startSpinning');
        this.outcomeSymbolsCounter = 0;
        this.stopRequested = false;
        new SimpleTimer( this.config.startReelDelay, this.spin.bind( this ) );
    }

    protected spin(): void {
        this.moveLastSymbolToTopSignal.dispatch(this.id, this.createNextSymbol(this.nextSymbol()), SymbolState.BLUR);
        this.tweenSymbolsDown(this.config.reelTween.duration, TWEEN.Easing.Linear.None);
    }

    protected tweenSymbolsDown(duration: number, easing: (k:  number) => number): void {
        let arr: Array<number> = [];
        for (let j = 0 ; j < this.reelSymbols.length; j++) {
            arr.push( this.reelSymbols[j].posY );
        }

        let tween = new SimpleTween({ y: 0 })
            .to({ y: this.config.symbol.height }, duration)
            .easing(easing)
            .onUpdate((coords) => {
                for (var i = 0; i < this.reelSymbols.length; i++) {
                    this.reelSymbols[i].posY = arr[i] + coords.y;
                    this.spinTweenUpdateSignal.dispatch(this.id, i, this.reelSymbols[i].posY);
                }
            })
            .onComplete(() => {
                this.tweenComplete();
            });

        tween.start();
    }

    protected createNextSymbol(name: string): SymbolData {
        let data: SymbolData = new SymbolData(name, this.reelSymbols[0].posY - this.config.symbol.height);
        this.reelSymbols.pop();
        this.reelSymbols.unshift(data);
        return data;
    }

    public requestStop(): void {
        this.stopRequested = true;
    }

    public tweenComplete(): void {
        if ( this.stopRequested ) {
            this.finalTweenComplete();
        } else {
            this.spin();
        }
    }

    protected finalTweenComplete(): void {
        let index: number = (this.symbolsOutcome.length - 1) - this.outcomeSymbolsCounter;
        if (this.outcomeSymbolsCounter <= this.config.symbolsOnReel) {
            if (this.outcomeSymbolsCounter == 0) {
                this.stopRequestedSignal.dispatch(this.id);
            }
            let symbolName: string = index > -1 ? this.symbolsOutcome[index] : this.nextSymbol();
            this.moveLastSymbolToTopSignal.dispatch(this.id, this.createNextSymbol(symbolName), SymbolState.STATIC);
            if (this.outcomeSymbolsCounter == this.config.symbolsOnReel) {
                this.tweenSymbolsDown(this.config.stopTween.duration, TWEEN.Easing.Back.Out);
            } else {
                this.tweenSymbolsDown(this.config.reelTween.duration, TWEEN.Easing.Linear.None);
            }
            this.outcomeSymbolsCounter++;

        } else {
            this.reelStopFinished();
        }
    }

    protected reelStopFinished(): void {
        this.reelStopedSignal.dispatch(this.id);
        this.dropAnimation();
    }

    protected dropAnimation() {
        for (var i: number = 1; i <= this.config.symbolsOnReel; i++) {
            if ( this.config.dropSymbols.indexOf(this.reelSymbols[i].symbolName) > -1) {
                this.dropAnimationSignal.dispatch(this.id, i);
            }
        }
    }
}

export class SymbolData {
    public symbolName: string;
    public posY: number;
    constructor(symbolName: string, posY: number) {
        this.symbolName = symbolName;
        this.posY = posY;
    }
}