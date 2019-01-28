import { SymbolAnimationPostfix, SymbolState } from './ReelsEnums';
import { IReelStripView, IReelStripConfig } from './ReelsView';
import { SymbolData } from './ReelStripModel';
import * as MiniSignal from 'mini-signals';
import { Container } from 'tioc-gg';
import { Symbol, ISymbol } from './Symbol';

export class ReelStripView implements IReelStripView {

    private readonly countTopExtraSymbol: number = 1;
    private readonly countBottomExtraSymbol: number = 1;

    public symbolAnimationCompleteSignal:  MiniSignal;

    protected stripContainer: PIXI.Container;
    protected id: number;
    protected symbols: Array< ISymbol >;
    protected totalSymbolsCount: number;
    protected config: IReelStripConfig;

    constructor( ) {
        this.symbolAnimationCompleteSignal = new MiniSignal();
    }

    public setContainer(stripContainer: PIXI.Container): void {
        this.stripContainer = stripContainer;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public symbolsInit(config: IReelStripConfig): void {
        this.config = config;
        this.totalSymbolsCount = this.countTopExtraSymbol + this.config.symbolsOnReel + this.countBottomExtraSymbol;
        this.createSymbols();
    }

    protected createSymbols(): void {
        this.symbols = new Array<ISymbol>();
        for (var i = 0; i < this.totalSymbolsCount; i++) {
            let symbol: ISymbol = this.createSymbol();
            symbol.setId(i);
            symbol.setConfig(this.config.symbol);
            symbol.symbolContainer.position.y = i * this.config.symbol.height - this.config.symbol.height;
            symbol.animationCompleteSignal.add(this.symbolAnimationComplete, this);
            this.stripContainer.addChild(symbol.symbolContainer);
            this.symbols.push(symbol);
        }
    }

    protected createSymbol(): ISymbol {
        return Container.get(Symbol);
    }

    protected symbolAnimationComplete(symbolId: number, type: SymbolAnimationPostfix): void {
        this.symbolAnimationCompleteSignal.dispatch(this.id, symbolId, type);
    }

    public tweenSymbolsUpdate(symbolId: number, y: number): void {
        this.symbols[symbolId].symbolContainer.y = y;
    }

    public moveLastSymbolToTop( symbolData: SymbolData, state: SymbolState ): void {
        var symbol :  ISymbol = this.symbols.pop();
        symbol.symbolContainer.position.y = symbolData.posY;
        symbol.setSymbolNameWithState( symbolData.symbolName, state);
        this.symbols.unshift( symbol) ;
        symbol.symbolContainer.parent.setChildIndex( symbol.symbolContainer,
                                                            symbol.symbolContainer.parent.children.length - 1 );

        this.symbols.forEach( ( element, i ) => {
            element.setId( i );
        });
    }

    public setSymbolNameWithState( symbolId: number, symbolName: string, state: SymbolState ): void {
        this.symbols[ symbolId ].setSymbolNameWithState( symbolName, state );
    }

    public setSymbolState( symbolId: number, state: SymbolState ): void {
        this.symbols[ symbolId ].setSymbolState( state );
    }

    public playSymbolAnimation( symbolId: number, typeAnim: SymbolAnimationPostfix ): boolean {
        return this.symbols[ symbolId ].playAnimation(typeAnim);
    }

    public hideSymbol( symbolId: number ): boolean {
        return this.symbols[ symbolId ].symbolContainer.visible = false;
    }

    public showSymbol( symbolId: number ): boolean {
        return this.symbols[symbolId].symbolContainer.visible = true;
    }

    public playItemsAnimation( itemId: number, typeAnim: SymbolAnimationPostfix ): boolean {
        return this.symbols[ this.countTopExtraSymbol + itemId ].playAnimation(typeAnim);
    }

    public deleteSymbolsAnimation(): void {
        for (var i = 0; i < this.symbols.length; i++) {
            this.symbols[i].deleteAnimation();
        }
    }
}