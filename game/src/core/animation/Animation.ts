import 'pixi-spine';
import TsMap from 'ts-map';
import * as PIXI from 'pixi.js';
import { Asset } from '../../utils/Types';
import { Helper } from '../../utils/Helper';

export class Animation  {
    public static TIME_SCALE : number = 1;
    public static readonly animationsByName: TsMap < string, PIXI.extras.AnimatedSprite >
                                                    = new TsMap < string, PIXI.extras.AnimatedSprite > ();

    public static createFrameAnimation  ( frames : Array < string > ) {
        let textureArray : Array < PIXI.Texture> = new Array <PIXI.Texture>();
        for ( let frame of frames ) {
            let texture = PIXI.Texture.fromFrame(frame);
            textureArray.push(texture);
        }
        return new PIXI.extras.AnimatedSprite( textureArray );
    }

    public static generateAssetsList(path: string, prefix: string, from: number, to: number,
        suffix : string = '', zeroPad : number = 0 ) : Array < Asset > {

        let result = new Array < Asset > ();
        let frames = Animation.generateFrameNames( prefix, from, to, suffix, zeroPad );
        for ( let i = 0; i < frames.length; i++ ) {
            result.push( { assetKey : frames[ i ], assetURL : path + frames[ i ] + Helper.PNG_TYPE } );
        }
        return result;
    }

    public static generateFrameNames(prefix: string, from: number, to: number,
        suffix : string = '', zeroPad : number = 0 ) : Array< string > {
        var result = [];
        var frame = '';
        for ( var i = from; i <= to; i++ ) {
            frame = i.toString();

            while ( frame.toString().length < zeroPad ) {
                frame = '0' + frame;
            }

            frame = prefix + frame + suffix;
            result.push( frame );
        }
        return result;
    }

    public static getAnimationByName(name: string, keepInMemory: boolean = false, zeroPad: number = 2)
                                                                                            : PIXI.extras.AnimatedSprite {
        if (this.animationsByName.has(name)) {
            return this.animationsByName.get(name);
        } else {
            let explosionTextures: Array<PIXI.Texture> = this.createFrameAnimationByName(name, zeroPad);
            if (explosionTextures.length > 0) {
                let animation: PIXI.extras.AnimatedSprite = new PIXI.extras.AnimatedSprite(explosionTextures);
                if (keepInMemory) {
                    this.animationsByName.set(name, animation);
                }
                return animation;
            } else {
                return null;
            }
        }
    }

    private static createFrameAnimationByName ( prefix : string, zeroPad : number = 0): Array<PIXI.Texture> {
        let explosionTextures: Array<PIXI.Texture> =  new Array<PIXI.Texture> ();
        let frame: string = '';
        let indexFrame: number = 0;

        while (true) {
            try {
                frame = indexFrame.toString();
                while ( frame.toString().length < zeroPad ) {
                    frame = '0' + frame;
                }
                let texture: PIXI.Texture = PIXI.Texture.fromFrame(prefix + '_' + frame + '.png');
                explosionTextures.push(texture);
                indexFrame++;
            } catch (e) {
                break;
            }
        }
        return explosionTextures;
    }
}