import { Singleton } from 'tioc-gg';

@Singleton
export class StateStore {
    public readonly baseGameIdle: string = 'baseGameIdle';
    public readonly startSpin: string = 'startSpin';
    public readonly spinning: string = 'spinning';
    public readonly spinStop: string = 'spinStop';
    public readonly showWinning: string = 'showWinning';
    public readonly showWinningLoop: string = 'showWinningLoop';
}