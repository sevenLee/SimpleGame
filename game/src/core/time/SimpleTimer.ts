import { ITickConsumer } from './ITickConsumer';

import * as MiniSignal from 'mini-signals';
import { Inject } from 'tioc-gg';
import { HeartTicker } from './HeartTicker';

export class SimpleTimer implements ITickConsumer {

    public isLoop : boolean;
    public eval : MiniSignal = new MiniSignal();

    protected pIsAlive : boolean;
    protected pDestroyOnDead : boolean;
    protected pDelta : number;
    protected pTimeLeft : number;

    @Inject
    protected timeManager : HeartTicker;

    constructor( deltaMs : number, evalf : Function, isLoop : boolean = false ) {
        this.isLoop = isLoop;
        this.pIsAlive = true;
        this.pTimeLeft = this.pDelta = deltaMs;

        if ( evalf != null ) {
            this.eval.add(evalf, this);
        }

        this.timeManager.register(this);
    }

    public isAlive(): boolean {
        return this.pIsAlive;
    }

    public stop(processCallback : boolean = false) {
        this.pIsAlive = false;
        if ( processCallback ) {
            this.eval.dispatch( Math.min( this.pDelta, 0 ) );
        }
    }

    public tick(deltaTimeMs: number) {

        if ( !this.pIsAlive ) {
            return;
        }

        this.pTimeLeft -= deltaTimeMs;
        while ( this.pTimeLeft <= 0 ) {
            this.eval.dispatch( Math.min( this.pDelta, -this.pTimeLeft ) );
            if ( this.isLoop ) {
                this.pTimeLeft += this.pDelta;
            } else {
                this.pIsAlive = false;
                return;
            }
        }
    }

    public destroy() : void {
        this.pIsAlive = false;
        this.eval.detachAll();
        this.eval = undefined;
        this.timeManager = undefined;
    }
}