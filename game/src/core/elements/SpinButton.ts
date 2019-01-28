import { Sprite, Point, Texture } from 'pixi.js';
import { Button } from './Button';
import { Actions } from './../mvc/Action';

export enum SpinButtonState {
    SPIN,
    STOP_SPIN,
    STOP_REELS
}

export class SpinButton extends Button {
    protected static readonly spinIconAsset = '_spin.png';
    protected static readonly stopIconAsset = '_stop.png';
    protected iconElement : Sprite;
    protected spinIcon : Texture;
    protected stopIcon : Texture;
    protected iconState : SpinButtonState;

    protected init() {
        super.init();
        this.iconElement 	= new Sprite();
        this.activeElement.addChild( this.iconElement );
        this.spinIcon = this.getTexture( SpinButton.spinIconAsset );
        this.stopIcon = this.getTexture( SpinButton.stopIconAsset );
        this.iconElement.texture = this.spinIcon;
    }

    set anchor( anchorPoint : Point ) {
        this.activeElement.anchor.set( anchorPoint.x, anchorPoint.y );
        this.iconElement.anchor.set( anchorPoint.x, anchorPoint.y );
    }

    public get currentButtonState() : SpinButtonState {
        return this.iconState;
    }

    protected onClick( event : any ): void {
        this.clickData.action = Actions.CLICK_ACTION_PREFIX + this.action;
        super.onClick( event );
    }

    public switchIconState( state : SpinButtonState ) : void {
        this.iconState = state;

        switch ( state ) {
            case SpinButtonState.SPIN:
                this.switchIconToSpin();
                break;
            case SpinButtonState.STOP_SPIN:
                this.switchIconToStopSpin();
                break;
        }
    }

    protected switchIconToSpin() : void {
        this.iconElement.texture = this.spinIcon;
        this.action = Actions.SPIN;
    }

    protected switchIconToStopSpin() : void {
        this.iconElement.texture = this.stopIcon;
        this.action = Actions.STOP_SPIN;
    }
}
