export class NMath {
    public static RAD_TO_DEG : number = 180.0 / Math.PI;
    public static DEG_TO_RAD : number = Math.PI / 180.0;

    public static radiansToDegrees( radians : number ) : number {
        return this.RAD_TO_DEG * radians;
    }

    public static degreesToRadians( degrees : number ) : number {
        return this.DEG_TO_RAD * degrees;
    }

    public static randomInt( min : number, max : number, round: boolean = false) : number {
        var result: number = Math.floor(Math.random() * (max - min + 1)) + min;
        if (round) {
            result = Math.round(result);
        }
        return result;
    }

    public static angleBetweenPointsDeg( p1 : PIXI.Point, p2 : PIXI.Point ) {
        return NMath.radiansToDegrees( NMath.angleBetweenPointsRad(p1, p2) );
    }

    public static angleBetweenPointsRad( p1 : PIXI.Point, p2 : PIXI.Point ) {
        return Math.atan2( p2.y - p1.y, p2.x - p1.x );
    }

    public static distanceBetweenPoints( p1 : PIXI.Point, p2 : PIXI.Point ) {
        return Math.sqrt( Math.pow( p2.x - p1.x, 2 ) + Math.pow( p2.y - p1.y, 2 ) );
    }

    public static sign( value : number ) : number {
        if ( value < 0 ) {
            return -1;
        } else {
            return 1;
        }
    }

    public static clamp( value : number, min : number, max : number ) : number {
        if ( value < min ) {
            return min;
        } else if ( value > max ) {
            return max;
        } else {
            return value;
        }
    }
}