import * as MiniSignal from 'mini-signals';
import * as MD from 'mobile-detect';
import * as PIXI from 'pixi.js';
import { Singleton } from 'tioc-gg';

@Singleton
export class Viewport {
    public static GAME_WIDTH_LANDSCAPE : number = 1280;

    public static GAME_HEIGHT_LANDSCAPE : number = 720;

    public static GAME_WIDTH_PORTRAIT : number = 720;

    public static GAME_HEIGHT_PORTRAIT : number = 1280;

    public static BACKGROUND_WIDTH_LANDSCAPE : number = 1560;

    public static BACKGROUND_HEIGHT_LANDSCAPE : number = 880;

    public static BACKGROUND_WIDTH_PORTRAIT : number = 880;

    public static BACKGROUND_HEIGHT_PORTRAIT : number = 1560;

    public readonly onResizeSignal : MiniSignal = new MiniSignal();

    public readonly onOrientationSignal : MiniSignal = new MiniSignal();

    public safeAreaWidth : number;

    public safeAreaHeight : number;

    public stageContainer : PIXI.Container;

    private _renderer : PIXI.WebGLRenderer | PIXI.CanvasRenderer;

    private pScreenSize : PIXI.Point;

    private pViewportTotalSize : PIXI.Point;

    private pSafeAreaOffset : PIXI.Point;

    private pDeviceOrientation : Orientation;

    private pIsMobileDevice : boolean;

    private maxOffsetX : number;
    private maxOffsetY : number;

    public get deviceWidth() : number {
        return this.pScreenSize.x;
    }

    public get deviceHeight() : number {
        return this.pScreenSize.y;
    }

    public get safeAreaOffset() : PIXI.Point {
        return this.pSafeAreaOffset.clone();
    }

    public get viewportTotalSize() : PIXI.Point {
        return this.pViewportTotalSize.clone();
    }

    public get deviceOrientation() : Orientation {
        return this.pDeviceOrientation;
    }

    public get isPortraitMode() : boolean {
        return this.pDeviceOrientation == Orientation.PORTRAIT;
    }

    public get innerWidth() : number {
        return window.innerWidth;
    }

    public get innerHeight() : number {
        return window.innerHeight;
    }

    public init ( stageContainer : PIXI.Container, renderer : PIXI.WebGLRenderer | PIXI.CanvasRenderer ) {
        var md = new MD(window.navigator.userAgent);
        this.pIsMobileDevice = md.mobile() != null;
        this.stageContainer = stageContainer;
        this._renderer = renderer;
        this.checkOrientation();
        this.pScreenSize = new PIXI.Point( this.safeAreaWidth, this.safeAreaHeight );
        this.pViewportTotalSize = new PIXI.Point( this.safeAreaWidth, this.safeAreaHeight );
        this.pSafeAreaOffset = new PIXI.Point(0, 0);
    }

    protected isOrientationLocked : boolean = false;

    public resizeStage( innerWidth : number, innerHeight : number ) : void {
        this.checkOrientation();
        this._renderer.view.style.width = innerWidth + 'px';
        this._renderer.view.style.height = innerHeight + 'px';
        let scaleCoeff = this.pIsMobileDevice ? 2 : 1;
        innerWidth *= scaleCoeff;
        innerHeight *= scaleCoeff;
        this._renderer.resize( innerWidth, innerHeight );

        var scale = Math.min( innerWidth / this.safeAreaWidth, innerHeight / this.safeAreaHeight );
        this.stageContainer.scale.set(scale, scale);
        this.pScreenSize.set(innerWidth, innerHeight);
        this.stageContainer.x = innerWidth / 2.0 - this.safeAreaWidth / 2.0 * scale;
        this.stageContainer.y = innerHeight / 2.0 - this.safeAreaHeight / 2.0 * scale;

        this.pSafeAreaOffset.set( 	Math.min( this.stageContainer.x / scale, this.maxOffsetX ),
                                    Math.min( this.stageContainer.y / scale, this.maxOffsetY )
                                );

        this.pViewportTotalSize.set( this.pSafeAreaOffset.x * 2.0 / scale + this.safeAreaWidth,
                                    this.pSafeAreaOffset.y * 2.0 / scale + this.safeAreaHeight );

        this.onResizeSignal.dispatch();
    }

    public getAlignedPoint( align : ViewportAlign ) : PIXI.Point {
        switch (align) {
            case ViewportAlign.LEFT_TOP:
                return new PIXI.Point(-this.pSafeAreaOffset.x, -this.pSafeAreaOffset.y);
            case ViewportAlign.LEFT_MIDDLE:
                return new PIXI.Point(-this.pSafeAreaOffset.x, this.safeAreaHeight / 2);
            case ViewportAlign.LEFT_BOTTOM:
                return new PIXI.Point(-this.pSafeAreaOffset.x, this.safeAreaHeight + this.pSafeAreaOffset.y);
            case ViewportAlign.CENTER_TOP:
                return new PIXI.Point(this.safeAreaWidth / 2, -this.pSafeAreaOffset.y);
            case ViewportAlign.CENTER_MIDDLE:
                return new PIXI.Point(this.safeAreaWidth / 2, this.safeAreaHeight / 2);
            case ViewportAlign.CENTER_BOTTOM:
                return new PIXI.Point(this.safeAreaWidth / 2, this.safeAreaHeight + this.pSafeAreaOffset.y);

            case ViewportAlign.RIGHT_TOP:
                return new PIXI.Point(this.safeAreaWidth + this.pSafeAreaOffset.x, -this.pSafeAreaOffset.y);

            case ViewportAlign.RIGHT_MIDDLE:
                return new PIXI.Point(this.safeAreaWidth + this.pSafeAreaOffset.x, this.safeAreaHeight / 2);

            case ViewportAlign.RIGHT_BOTTOM:
                return new PIXI.Point(this.safeAreaWidth + this.pSafeAreaOffset.x,
                                        this.safeAreaHeight + this.pSafeAreaOffset.y);
        }
    }

    protected checkOrientation() : void {
        if ( this.isOrientationLocked ) {
            return;
        }

        let previousOrientation : Orientation = this.pDeviceOrientation;

        if ( this.innerWidth / this.innerHeight >= 4.0 / 3.0 ) {
            this.setupLandscapeOrientation();
        } else {
            this.setupPortraitOrientation();
        }

        if ( this.deviceOrientation != previousOrientation || previousOrientation == null ) {
            this.onOrientationSignal.dispatch();
        }
    }

    protected setupLandscapeOrientation( ) : void {
        this.pDeviceOrientation = Orientation.LANDSCAPE;
        this.safeAreaWidth = Viewport.GAME_WIDTH_LANDSCAPE;
        this.safeAreaHeight = Viewport.GAME_HEIGHT_LANDSCAPE;

        this.maxOffsetX = ( Viewport.BACKGROUND_WIDTH_LANDSCAPE - this.safeAreaWidth  ) / 2;
        this.maxOffsetY = ( Viewport.BACKGROUND_HEIGHT_LANDSCAPE - this.safeAreaHeight ) / 2;
    }

    protected setupPortraitOrientation( ) : void {
        this.pDeviceOrientation = Orientation.PORTRAIT;
        this.safeAreaWidth = Viewport.GAME_WIDTH_PORTRAIT;
        this.safeAreaHeight = Viewport.GAME_HEIGHT_PORTRAIT;

        this.maxOffsetX = ( Viewport.BACKGROUND_WIDTH_PORTRAIT - this.safeAreaWidth ) / 2;
        this.maxOffsetY = ( Viewport.BACKGROUND_HEIGHT_PORTRAIT - this.safeAreaHeight ) / 2;
    }

    public addChild< T extends PIXI.DisplayObject >( child : T ) : T {
        return this.stageContainer.addChild( child );
    }

    public removeChild ( child : PIXI.DisplayObject ) : PIXI.DisplayObject {
        return this.stageContainer.removeChild( child );
    }

    public get renderer () : PIXI.WebGLRenderer | PIXI.CanvasRenderer {
        return this._renderer;
    }
}

export enum ViewportAlign {
    LEFT_TOP,
    LEFT_MIDDLE,
    LEFT_BOTTOM,
    CENTER_TOP,
    CENTER_MIDDLE,
    CENTER_BOTTOM,
    RIGHT_TOP,
    RIGHT_MIDDLE,
    RIGHT_BOTTOM
}

export enum Orientation {
    PORTRAIT = 'Portrait',
    LANDSCAPE = 'Landscape'
}