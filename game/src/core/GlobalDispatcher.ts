import {GameController} from '../core/GameController';
import {Container} from 'tioc-gg';
import TsMap from 'ts-map';

export class EventParams {
    public type: string;
    public data: any;

    constructor(type: string, data: any) {
        this.type = type;
        this.data = data;
    }
}

export class EventMap {
    public context: any;
    public event: string;
    public callback: Function;

    constructor(context: any, event: string, callback: Function) {
        this.context = context;
        this.event = event;
        this.callback = callback;
    }

    public dispose(): void {
        this.callback = null;
    }
}

export interface IListener {
    addEventListeners(): void;
}

export class GlobalDispatcher {

    public static eventToHandlers: TsMap<string, EventMap> = new TsMap<string, EventMap>();

    public static addListener(context: IListener, event: string, callback: Function): void {
        if (this.eventToHandlers.has(event)) {
            throw 'this event:[' + event + '] is already in use';
        } else {
            this.eventToHandlers.set(event, new EventMap(context, event, callback));
        }
    }

    public static removeListener(event: string, callback: Function): void {
        if (this.eventToHandlers.has(event)) {
            let handler: EventMap = this.eventToHandlers.get(event);
            if (handler.callback == callback) {
                handler.dispose();
                this.eventToHandlers.delete(event);
            }
        }
    }

    private static dispatch(event: string, params: Object = null): void {
        if (this.eventToHandlers.has(event)) {
            let handler: EventMap = this.eventToHandlers.get(event);
            this.call(handler.context, handler.callback, new EventParams(event, params));
        } else {
            throw 'this event:[' + event + '] no one is waiting';
        }
    }

    private static call(context: any, fn: Function, param: EventParams = null): void {
        if (param.data != null) {
            fn.call(context, param);
        } else {
            if (fn.length > 0) {
                fn.call(context, param);
            } else {
                fn.call(context);
            }
        }
    }

    public static removeAllListeners(): void {
        for (var event in this.eventToHandlers) {
            if  ( event != undefined ) {
                let handler: EventMap = this.eventToHandlers.get(event);
                handler.dispose();
                this.eventToHandlers.delete(event);
            }
        }
    }

    public static dispatchIntoExpectedState(event: string, state: string, params: Object = null): void {
        if (Container.get(GameController).currentStateName == state) {
            this.dispatch(event, params);
        } else {
            throw 'this event:[' + event + '] do not dispatch because error in current state: [' +
            Container.get(GameController).currentStateName + '] do not match with target state [' + state + ']';
        }
    }

    public static dispatchIntoExpectedStates(event: string, states: Array<string>, params: Object = null): void {
        if (states.indexOf(Container.get(GameController).currentStateName) >= 0) {
            this.dispatch(event, params);
        } else {
            throw 'this event:[' + event + '] do not dispatch because error in current state: [' +
            Container.get(GameController).currentStateName + '] do not match with target states [' + states + ']';
        }
    }
}