import {CompView} from '../../core/mvc/CompView';
import {IFpsIndicatorObject} from './IFpsIndicatorObject';
import * as FpsIndicator from 'fps-indicator';


export class FPSMeterView extends CompView {
	private fpsIndicator: IFpsIndicatorObject;
	private _fpsStyle: Object = {
		'top': '0px',
		'bottom': 'auto',
		'background-color': '#ffffff',
		'color': '#666666',
		'font-size': '20px'
	};

	protected get fpsStyle() {
		return this._fpsStyle;
	}

	protected set fpsStyle(newStyleData: Object) {
		this._fpsStyle = newStyleData;
		Object.keys(newStyleData).forEach(prop => {
			this.fpsIndicator.element.style[prop] = newStyleData[prop];
		});
	}

	constructor() {
		super();
	}

	public init(): void {
		this.createFPSMeter();
	}

	protected createFPSMeter() {
		this.fpsIndicator = FpsIndicator({
			style: this._fpsStyle
		});
	}
}