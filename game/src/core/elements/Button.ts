import { Point, Sprite, Texture } from 'pixi.js';
import * as MiniSignal from 'mini-signals';
import { Inject } from 'tioc-gg';
import { Actions } from './../mvc/Action';
import { GameController } from './../GameController';

export interface IHitArea {
    width? : number;
    height? : number;
    radius? : number;
}

export interface IButtonConfig {
    id : string;
    action : string;
    assetName : string;
    isLocal?: boolean;
    x? : number;
    y? : number;
    hitArea? : IHitArea;
    scale? : Point;
}

export class Button extends PIXI.Container {
    @Inject
    protected gameController: GameController;
    protected assetName: string;
    protected readonly enabledFrame = '_Enabled.png';
    protected readonly disabledFrame = '_Disabled.png';
    protected readonly overFrame = '_Over.png';
    protected readonly downFrame = '_Down.png';
    public static ENABLED_STATE = 'enable';
    public static DISABLED_STATE = 'disable';
    public state: string;
    public activeElement: Sprite;
    public enabledElement: Texture;
    public disabledElement: Texture;
    public overElement: Texture;
    public downElement: Texture;
    public elementSignal: MiniSignal;
    protected action: string;
    protected _id: string;
    protected clickData: any;

    constructor (buttonConfig : IButtonConfig) {
        super();
        this.elementSignal = new MiniSignal();
        this.clickData = {};
        if ( buttonConfig.action != undefined ) {
            this.action = buttonConfig.action;
        }
        if ( buttonConfig.assetName != undefined ) {
            this.assetName = buttonConfig.assetName;
        }
        if ( buttonConfig.x != undefined ) {
            this.position.x = buttonConfig.x;
        }
        if ( buttonConfig.y != undefined ) {
            this.position.y = buttonConfig.y;
        }
        if ( buttonConfig.scale != undefined ) {
            this.scale = buttonConfig.scale;
        }

        this.init();
        this.setEnable(true);
        this.addListeners();
    }

    protected init(): void {
        this.activeElement = new Sprite();
        this.addChild(this.activeElement);

        this.enabledElement = this.getTexture(this.enabledFrame);
        this.disabledElement = this.getTexture(this.disabledFrame, false);
        this.overElement = this.getTexture(this.overFrame, false);
        this.downElement = this.getTexture(this.downFrame, false);
    }

    get id(): string {
        return this._id;
    }

    protected addListeners(): void {
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointertap', this.onClick, this);
    }

    protected onClick( event : any ): void {
        let action : string = Actions.CLICK_ACTION_PREFIX + this.action;
        if ( this.action != Actions.EMPTY ) {
            this.gameController.handleAction( action, this.clickData );
        } else {
            throw 'need action for button:' + this.id;
        }

        this.clickData.action = action;
        this.elementSignal.dispatch( this.clickData );
    }

    protected getTexture(nameFrame: string, isRequired : boolean = true): PIXI.Texture {
        let fullAssetName : string =  this.assetName + nameFrame;
        if ( PIXI.utils.TextureCache[fullAssetName] == undefined ) {
            if ( isRequired ) {
                throw 'button texture doesn\'t exist: ' + fullAssetName;
            } else {
                console.log('button texture doesn\'t exist: ' + fullAssetName);
            }
        }
        return PIXI.utils.TextureCache[fullAssetName];
    }

    public setEnable( value: boolean ) : void {
        if (value) {
            this.setState( Button.ENABLED_STATE );
            this.showEnabledElement();
        } else {
            this.setState( Button.DISABLED_STATE );
            this.showDisabledElement();
        }
        this.interactive = value;
    }

    protected showEnabledElement ( ): void {
        this.activeElement.texture = this.enabledElement;
    }

    protected showDisabledElement ( ): void {
        if ( this.disabledElement != undefined ) {
            this.activeElement.texture = this.disabledElement;
        }
    }

    protected onPointerDown( e : Event ): void {
        if ( this.downElement != undefined ) {
            this.activeElement.texture = this.downElement;
        }
    }

    protected onPointerUp( e : Event ): void {
        if ( this.overElement != undefined ) {
            this.activeElement.texture = this.overElement;
        }
    }

    protected onPointerOver( e : Event ): void {
        if ( this.overElement != undefined ) {
            this.activeElement.texture = this.overElement;
        }
    }

    protected onPointerOut( e : Event ): void {
        if ( this.state == Button.ENABLED_STATE ) {
            this.showEnabledElement();
        } else {
            this.showDisabledElement();
        }
    }

    public setState( stateName : string ) {
        this.state = stateName;
    }

}
