import { Inject } from 'tioc-gg';
import { FPSMeterView } from './FPSMeterView';
import { CompController } from '../../core/mvc/CompController';

export class FPSMeterController extends CompController {
	protected view: FPSMeterView;

	constructor( @Inject view : FPSMeterView ) {
		super(view);
	}

	public init(): void {
		this.initFPSMeterView();
	}

	protected initFPSMeterView(): void {
		this.view.initialize();
		this.view.init();
	}
}