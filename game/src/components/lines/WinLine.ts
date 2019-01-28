export class WinLine {
    public reelPositions : Array < number >; // [0, 0, 0, 1, 2],
    public winningCombination : Array < string > ; //  [‘N’, ‘N’, ‘N’, ‘N’],
    public symbols : Array< string >; //  [‘N’, ‘N’, ‘N’, ‘WILD’, ‘_’],
    public line : number; // 20,
    public payout : number; // 15
}