import { Inject } from 'tioc-gg';
import { SimpleTimer } from '../time/SimpleTimer';
import { GameController } from './../GameController';
import { CompController } from '../mvc/CompController';

export class MockServer extends CompController {
    @Inject
    protected gameController: GameController;

    public startSpin( ) : void {
        new SimpleTimer( 2000, this.onServerResponse.bind( this ) );
    }

    public onServerResponse ( ) : void {
        const mockResponse: any = {
            total_win: 1,
            reelIndexes: [
                ['Q', 'PIC3', 'T'],
                ['PIC3', 'Q', 'J'],
                ['PIC3', 'Q', 'N'],
                ['PIC4', 'Q', 'J'],
                ['PIC4', 'Q', 'T']
            ],
            winLines: [
                {
                    reelPositions: [0, 1, 1, 1, 1],
                    symbols: ['Q', 'Q', 'Q', 'Q', 'Q'],
                    winningCombination: ['Q', 'Q', 'Q', 'Q', 'Q']
                },
                {
                    reelPositions: [1, 0, 0],
                    symbols: ['PIC3', 'PIC3', 'PIC3', '*', '*'],
                    winningCombination: ['PIC3', 'PIC3', 'PIC3']
                }
            ]
        };

        if (mockResponse.total_win > 0) {
            this.gameController.baseSpinWithWinning(mockResponse);
        } else {
            this.gameController.baseSpin(mockResponse);
        }

    }
}