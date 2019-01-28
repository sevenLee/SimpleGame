import { Inject, Singleton, Container } from 'tioc-gg';
import { CoreState } from './mvc/CoreState';
import { StateStore } from './mvc/StateStore';
import { ComponentManager } from '../components/ComponentManager';

@Singleton
export class GameController {

    @Inject
    protected store : StateStore;
    @Inject
    protected componentManager : ComponentManager;

    protected _currentStateName : string;
    get currentStateName() : string {
        return this._currentStateName;
    }

    constructor () {
        this.addEventListeners();
    }

    public addEventListeners(): void {
        // do something
    }

    public handleAction( action : string, data? : any ) : void {
        if ( typeof this[action] === 'function' ) {
            this[action](data);
        }
    }

    protected action_spin(): void {
        this.startSpin();
    }

    public baseSpin(statDatas: any) : void {
        this.executeFlow([this.store.spinStop, this.store.baseGameIdle], statDatas);
    }

    public baseSpinWithWinning(statDatas: any) : void {
        this.executeFlow([this.store.spinStop, this.store.showWinning, this.store.showWinningLoop, this.store.baseGameIdle], statDatas);
    }

    protected startSpin( ) : void {
       this.executeFlow([this.store.baseGameIdle, this.store.startSpin, this.store.spinning]);
    }

    private executeFlow(stateFlow: Array<string>, statDatas?: Array<any>): void {
        stateFlow.forEach( ( stateName : string, index: number ) => {
            const state : CoreState = new CoreState ( stateName );
            if (statDatas) {
                state.stateData = statDatas;
            }
            this.onStateIsChanged(stateName);
            this.componentManager.setState( state );
        });
    }

    protected onStateIsChanged ( stateName : string ) : void {
        this._currentStateName = stateName;
    }
}