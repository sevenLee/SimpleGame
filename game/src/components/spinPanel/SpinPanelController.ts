import * as MiniSignal from 'mini-signals';
import { Inject, Singleton } from 'tioc-gg';
import { CompController } from './../../core/mvc/CompController';

import { SpinPanelView, ISpinPanelConfig } from './SpinPanelView';
import { SpinPanelConfig } from './SpinPanelConfig';

@Singleton
export class SpinPanelController extends CompController {

    public onSpinEvent : MiniSignal;

    protected view : SpinPanelView;

    constructor ( @Inject view : SpinPanelView ) {
        super( view );
        this.onSpinEvent = new MiniSignal();
    }

    public init( ): void {
        let config = this.gameConfig.getConfig<ISpinPanelConfig>( SpinPanelConfig );
        this.view.initialize( config );
    }
}