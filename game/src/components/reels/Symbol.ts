import { SymbolState, SymbolStatePostfix, SymbolAnimationPostfix } from './ReelsEnums';
import { Animation } from '../../core/animation/Animation';
import * as MiniSignal from 'mini-signals';

import * as PIXI from 'pixi.js';
import AnimatedSprite = PIXI.extras.AnimatedSprite;
import Container = PIXI.Container;
import Sprite = PIXI.Sprite;

export interface ISymbolConfig {
    width: number;
    height: number;
}

export interface ISymbol {
    symbolName: string;
    symbolContainer : Container;
    animationCompleteSignal : MiniSignal;

    setId(id: number): void;
    deleteAnimation() : void;
    setConfig(config: ISymbolConfig): void;
    playAnimation(type: SymbolAnimationPostfix): boolean;
    setSymbolNameWithState(symbolName: string, state: SymbolState): void;
    setSymbolState( state : SymbolState ) : void;
}

export class Symbol implements ISymbol {

    public static SYMBOL_ANIMATION_FRAME_COUNT : number = 60;

    public animationCompleteSignal: MiniSignal;

    private id: number;
    public symbolName: string;
    private symbolLayer: Sprite;
    private config: ISymbolConfig;
    private animationLayer: Container;
    private itemAnimation: AnimatedSprite;
    protected symbolState : SymbolState;
    protected textureName : string;

    private _symbolContainer: Container;

    constructor() {
        this.animationCompleteSignal = new MiniSignal();
        this.symbolLayer = new Sprite();
        this.symbolLayer.anchor.set( 0.5, 0.5 );
        this.textureName = '';

        this.animationLayer = new Container();
        this._symbolContainer = new Container();
        this._symbolContainer.addChild(this.symbolLayer);
        this._symbolContainer.addChild(this.animationLayer);
    }

    public setId(id: number): void {
        this.id = id;
    }

    public setConfig(config: ISymbolConfig): void {
        this.config = config;
    }

    public setSymbolNameWithState(symbolName: string, state: SymbolState): void {
        this.symbolName = symbolName;
        this.setSymbolState( state );
    }

    public setSymbolState( state : SymbolState ) : void {
        if ( this.textureName == this.getFullSymbolName( state ) ) {
            return;
        }

        this.symbolState = state;
        let texture;
        try {
            this.textureName = this.getFullSymbolName( state );
            texture = PIXI.Texture.fromFrame( this.textureName );
        } catch (e) {
            if (state == SymbolState.BLUR || state == SymbolState.LOSE) {
                this.textureName = this.getFullSymbolName( SymbolState.STATIC );
                texture = PIXI.Sprite.fromFrame( this.textureName ).texture;
            } else {
                throw 'not found texture:' + this.textureName;
            }
        }
        this.symbolLayer.position.set( this.config.width / 2, this.config.height / 2 );
        this.symbolLayer.texture = texture;
    }

    public getAssetPostfixForState ( state : SymbolState ) : string {
        switch ( state ) {
            case SymbolState.STATIC:
                return SymbolStatePostfix.STATIC;

            case SymbolState.LOSE:
                return SymbolStatePostfix.LOSE;

            case SymbolState.BLUR:
                return SymbolStatePostfix.BLUR;
        }
    }

    public deleteAnimation(): void {
        if (this.itemAnimation != null) {
            this.itemAnimation.gotoAndStop(0);
        }

        this.animationLayer.removeChildren();
        this.symbolLayer.visible = true;
    }

    public playAnimation(type: SymbolAnimationPostfix, useNativeSpeed: boolean = false): boolean {
        this.symbolLayer.visible = true;

        this.itemAnimation = Animation.getAnimationByName('symbol_' + this.symbolName + type);
        if (this.itemAnimation == null) {
            return false;
        }
        this.symbolLayer.visible = false;
        if ( !useNativeSpeed ) {
            this.itemAnimation.animationSpeed = this.itemAnimation.totalFrames / Symbol.SYMBOL_ANIMATION_FRAME_COUNT;
        }
        this.itemAnimation.anchor.set(0.5);
        this.itemAnimation.x = this.config.width / 2;
        this.itemAnimation.y = this.config.height / 2;

        this.itemAnimation.gotoAndStop(0);
        this.animationLayer.removeChildren();
        this.animationLayer.addChild(this.itemAnimation);
        this.itemAnimation.loop = false;
        this.itemAnimation.onComplete = this.onCompleteItemAnimation.bind(this, this.id, type); // todo sometimes lost context
        this.itemAnimation.gotoAndPlay(0);
        return true;
    }

    protected onCompleteItemAnimation(id: number, type: SymbolAnimationPostfix): void {
        if ( this.itemAnimation != null ) {
            this.itemAnimation.gotoAndStop(0);
        }
        this.animationCompleteSignal.dispatch(id, type);
    }

    protected getFullSymbolName( state : SymbolState = this.symbolState ) : string {
        return 'symbol_' + this.symbolName + this.getAssetPostfixForState( state ) + '.png';
    }

    get symbolContainer() : Container {
        return this._symbolContainer;
    }
}