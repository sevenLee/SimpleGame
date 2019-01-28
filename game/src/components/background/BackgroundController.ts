import { Inject } from 'tioc-gg';
import { CompController } from '../../core/mvc/CompController';
import { IBackgroundConfig } from './IBackgroundConfig';
import { BackgroundConfig } from './BackgroundConfig';
import { BackgroundView } from './BackgroundView';

export class BackgroundController extends CompController {
    protected view : BackgroundView;

    constructor ( @Inject view : BackgroundView ) {
        super( view );
    }

    public init(data?: any): void {
        let config = this.gameConfig.getConfig<IBackgroundConfig>( BackgroundConfig );
        this.view.initialize( config  );
    }
}