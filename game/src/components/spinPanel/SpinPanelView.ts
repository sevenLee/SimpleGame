import { Point } from 'pixi.js';
import {Asset} from '../../utils/Types';
import { CompView, ICompViewConfig } from '../../core/mvc/CompView';
import { SpinButton, SpinButtonState } from '../../core/elements/SpinButton';
import { IButtonConfig } from '../../core/elements//Button';
import { ViewportAlign } from '../../core/viewport/Viewport';

export interface ISpinPanelConfig extends ICompViewConfig {
    spinButton: IButtonConfig;
    stopButton: IButtonConfig;
}

export class SpinPanelView extends CompView {
    protected spinConfig : ISpinPanelConfig;
    protected spinButton : SpinButton;

    protected createElements( config : ISpinPanelConfig ) : void {
        this.spinConfig = config;

        this.spinButton = new SpinButton ( config.spinButton );
        this.spinButton.anchor = new Point( 0.5, 0.5 );
        this.addChild( this.spinButton );
    }

    public getAssetsList( ) :  Array < Asset > {
        return [
            { 	assetKey :  'ngui',
                assetURL : 	'assets/ngui/ngui.json'
            }
        ];
    }

    public showStopSpinButton() : void {
        this.spinButton.switchIconState( SpinButtonState.STOP_SPIN );
    }

    public portraitLayout() : void {
        this.spinButton.x = this.spinConfig.spinButton.x;
        this.spinButton.y = this.spinConfig.spinButton.y;
    }

    public landscapeLayout() : void {
        this.spinButton.x = this.viewport.getAlignedPoint( ViewportAlign.RIGHT_MIDDLE ).x - 150;
        this.spinButton.y = this.viewport.getAlignedPoint( ViewportAlign.RIGHT_MIDDLE ).y;
    }
}
