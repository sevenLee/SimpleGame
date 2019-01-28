import { Container, Singleton } from 'tioc-gg';
import { Helper } from '../utils/Helper';

@Singleton
export class GameConfig {
    public getConfig < T > ( source: Function ) : T {
        return < T > Helper.mergeTwoObjects({}, Container.get( source ) );
    }
}

