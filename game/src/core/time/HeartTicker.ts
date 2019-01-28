import * as MiniSignal from 'mini-signals';
import { Singleton } from 'tioc-gg';
import { Animation } from '../animation/Animation';
import { ITickConsumer } from './ITickConsumer';

@Singleton
export class HeartTicker {
    public static MAX_UPDATE_INTERVAL_MS : number = 5;
    protected _isPaused : boolean = false;
    public set isPaused ( isPaused : boolean ) {
        this._isPaused = isPaused;
    }

    public get isPaused () : boolean {
        return this._isPaused;
    }

    protected timers : Array<ITickConsumer> = new Array<ITickConsumer>();
    protected savedTimeMs : number = 0;
    protected turboTimeScale : number = 1.5;
    protected normalTimeScale : number = 1.0;
    public onTimeScaleChanged : MiniSignal;
    private _timeScale : number;

    private set timeScale ( timeScale : number ) {
        if (this._timeScale != timeScale ) {
            this._timeScale = timeScale;
            Animation.TIME_SCALE = timeScale;
            this.onTimeScaleChanged.dispatch();
        }
    }

    private get timeScale () : number {
        return this._timeScale;
    }

    constructor () {
        this.onTimeScaleChanged = new MiniSignal();
        this.timeScale = this.normalTimeScale;

        requestAnimationFrame( this.embededUpdate.bind ( this ) );
    }

    protected embededUpdate( timeMs : number ) {
        if ( !this.isPaused ) {
            this.doTick( (timeMs - this.savedTimeMs) * this._timeScale );
        }
        this.savedTimeMs = timeMs;

        requestAnimationFrame( this.embededUpdate.bind ( this ) );
    }

    public doTick ( deltaTimeMs : number ) {

        while ( deltaTimeMs > 0 ) {
            for ( let i = this.timers.length - 1; i >= 0; i-- ) {
                if ( this.timers[i].isAlive() ) {
                    this.timers[i].tick( Math.min(deltaTimeMs, HeartTicker.MAX_UPDATE_INTERVAL_MS));
                } else {
                    this.timers.splice(i, 1);
                }
            }

            deltaTimeMs -= HeartTicker.MAX_UPDATE_INTERVAL_MS;
        }
    }

    public register ( tickConsumer : ITickConsumer ) {
        if ( this.timers.indexOf(tickConsumer) > -1 ) {
            console.log('[HeartTicker:] this listener already in the list! ');
        } else {
            this.timers.push(tickConsumer);
        }
    }

    public unregister ( tickConsumer : ITickConsumer ) {
        let i = this.timers.indexOf( tickConsumer );
        if ( i > -1 ) {
            delete this.timers[i];
        } else {
            console.log('[HeartTicker:] can\'t remove element, it is not in the array! ');
        }
    }

    public turnOnTurbo ( turboTimeScale? : number ) : void {
        if ( turboTimeScale == undefined ) {
            turboTimeScale = this.turboTimeScale;
        }
        this.timeScale = turboTimeScale;
    }

    public turnOffTurbo () : void {
        this.timeScale = this.normalTimeScale;
    }
}