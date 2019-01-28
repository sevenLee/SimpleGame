export interface ITickConsumer {
    isAlive() : boolean;
    tick( deltaTimeMs : number );
}