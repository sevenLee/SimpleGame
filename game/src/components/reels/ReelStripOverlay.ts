import { ReelStripView } from './ReelStripView';

export class ReelStripOverlay extends ReelStripView {

    protected createSymbols(): void {
        super.createSymbols();
        for (var i = 0; i < this.totalSymbolsCount; i++) {
            this.symbols[i].symbolContainer.visible = false;
        }
    }
}