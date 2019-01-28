import { TweenJSTickConsumer } from './TweenJSTickConsumer';
import * as TWEEN from '@tweenjs/tween.js';

export class SimpleTween extends TWEEN.Tween {

    public start(): TWEEN.Tween {
        super.start( TweenJSTickConsumer.timeMs );
        return this;
    }
}