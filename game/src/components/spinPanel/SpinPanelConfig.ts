import { Inject } from 'tioc-gg';
import { Actions } from './../../core/mvc/Action';

export class SpinPanelConfig {
    public name = 'spinPanel';
    public spinButton = {
        name: 'spin_button',
        x: 350,
        y: 1120,
        action: Actions.SPIN,
        assetName : 'spin',
    };
    public stopButton = {
        name: 'stop_button',
        x: 350,
        y: 1000,
        action: Actions.STOP_SPIN,
        assetName : 'stop',
    };
}