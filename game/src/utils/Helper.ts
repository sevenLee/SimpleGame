import { Point } from 'pixi.js';

export class Helper {
    public static  UNDEFINED_TYPE : string = 'undefined';

    public static  PNG_TYPE : string = '.png';

    public static removeItemsFromArray( array : Array < any >, item : any ) {
        while ( array.indexOf ( item ) > -1 ) {
            array.splice( array.indexOf ( item ), 1 );
        }
        return array;
    }

    public static getFillinArray( from : number, to : number ) : Array< number > {
        if ( to < from ) {
            return [];
        }

        let array : Array < number > = [];
        for (var index = from; index < to; index++) {
            array.push ( index );
        }

        return array;
    }

    public static mergeTwoObjects ( objectA : Object, objectB : Object ) {
        Object.keys( objectB ).forEach( function( key ) { objectA[ key ] = objectB[ key ]; } );

        return objectA;
    }

    public static getURLParameter( name : string ) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)
        || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    public static getQueryString(paramsObj: object): string {
        const paramKeys: Array<string> = Object.keys(paramsObj);
        let paramKeyValues: Array<string> = [];

        paramKeys.forEach(paramKey => {
            paramKeyValues.push(encodeURIComponent(paramKey) + '=' + encodeURIComponent(paramsObj[paramKey]));
        });

        return paramKeyValues.join('&');
    }

    public static getWorldCoordinates( displayObject : PIXI.DisplayObject ) : Point {
        let x : number = 0;
        let y : number = 0;

        for (let current = displayObject; current != undefined; current = current.parent) {
            x += current.x;
            y += current.y;
        }

        return new Point( x, y );
    }

    public static convertWorldToLocalCoordinates( position : Point, displayObject : PIXI.DisplayObject ) : Point {
        let x : number = 0;
        let y : number = 0;

        for (let current = displayObject; current != undefined; current = current.parent) {
            x += current.x;
            y += current.y;
        }

        position.x -= x;
        position.y -= y;
        return position;
    }
}