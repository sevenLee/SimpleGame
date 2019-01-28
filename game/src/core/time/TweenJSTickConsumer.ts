import { ITickConsumer } from './ITickConsumer';

import * as TWEEN from '@tweenjs/tween.js';

export class TweenJSTickConsumer implements ITickConsumer {

    public static timeMs : number = 0;

    public isAlive(): boolean {
        return true;
    }

    public tick ( deltaTimeMs: number ) {
        TweenJSTickConsumer.timeMs += deltaTimeMs;
        TWEEN.update( TweenJSTickConsumer.timeMs );
    }
}