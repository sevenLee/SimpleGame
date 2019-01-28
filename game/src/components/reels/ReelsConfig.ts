import { IReelsConfig, IReelStripConfig, IGameElement } from './ReelsView';


export class ReelsConfig implements IReelsConfig {
    private reelY : number = 800;

    public name : string = 'reels';
    public idleAnimationDelay : number =  0;
    public reelStopNormalTime : number =  500;

    public portraitPositionX : number = -96;
    public portraitPositionY : number = -300;
    public portraitScale : number = 0.71;

    public reels: IReelStripConfig[] = [
        {
            landscapeX: 130,
            landscapeY: this.reelY,
            width: 200,
            symbol: {
                width: 200,
                height: 200
            },
            id: 0,
            rangeSymbols: [ 'A', 'K', 'Q', 'J', 'T', 'N', 'PIC1', 'PIC2', 'PIC3', 'PIC4', 'WILD', 'SCATTER'],
            dropSymbols: [ 'WILD', 'SCATTER'],
            symbolsOnReel:  3,
            reelTween: {duration: 125},
            stopTween: {duration: 400},
            startReelDelay: 0,
            stopReelNormalDelay: 0
        }, {
            landscapeX: 330,
            landscapeY: this.reelY,
            width: 215,
            symbol: {
                width: 200,
                height: 200
            },
            id: 1,
            rangeSymbols: [ 'A', 'K', 'Q', 'J', 'T', 'N', 'PIC1', 'PIC2', 'PIC3', 'PIC4', 'WILD', 'SCATTER'],
            dropSymbols: [ 'WILD', 'SCATTER'],
            symbolsOnReel: 3,
            reelTween: {duration: 125},
            stopTween: {duration: 400},
            startReelDelay: 100,
            stopReelNormalDelay: 200
        }, {
            landscapeX: 530,
            landscapeY: this.reelY,
            width: 215,
            symbol: {
                width: 200,
                height: 200
            },
            id: 2,
            rangeSymbols: [ 'A', 'K', 'Q', 'J', 'T', 'N', 'PIC1', 'PIC2', 'PIC3', 'PIC4', 'WILD', 'SCATTER'],
            dropSymbols: [ 'WILD', 'SCATTER'],
            symbolsOnReel: 3,
            reelTween: {duration: 125},
            stopTween: {duration: 400},
            startReelDelay: 200,
            stopReelNormalDelay: 200
        }, {
            landscapeX : 730,
            landscapeY : this.reelY,
            width: 215,
            symbol : {
                width: 200,
                height: 200
            },
            id : 3,
            rangeSymbols: [ 'A', 'K', 'Q', 'J', 'T', 'N', 'PIC1', 'PIC2', 'PIC3', 'PIC4', 'WILD', 'SCATTER'],
            dropSymbols: [ 'WILD', 'SCATTER'],
            symbolsOnReel : 3,
            reelTween: {duration: 125},
            stopTween: {duration: 400},
            startReelDelay: 300,
            stopReelNormalDelay: 200
        }, {
            landscapeX: 930,
            landscapeY: this.reelY,
            width: 215,
            symbol : {
                width: 200,
                height: 200
            },
            id : 4,
            rangeSymbols: [ 'A', 'K', 'Q', 'J', 'T', 'N', 'PIC1', 'PIC2', 'PIC3', 'PIC4', 'WILD', 'SCATTER'],
            dropSymbols: [ 'WILD', 'SCATTER'],
            symbolsOnReel : 3,
            reelTween: {duration: 125},
            stopTween: {duration: 400},
            startReelDelay : 400,
            stopReelNormalDelay : 200
        }
    ];

    public reelBackground?: IGameElement;
    public reelsFrames?: IGameElement[];
}
