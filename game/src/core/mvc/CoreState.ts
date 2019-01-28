export class CoreState {
    private name : string;
    private data : any;

    constructor ( pName : string, pData? : any ) {
        this.name = pName;

        if ( pData != null ) {
            this.data = pData;
        } else {
            this.data = new Object();
        }
    }

    public get stateName () : string {
        return this.name;
    }

    public get stateData () : any {
        return this.data;
    }

    public set stateData ( pData : any ) {
        this.data = pData;
    }

    public toString() : string {
        console.log( ' ( ' + this.name + ', { ' +  this.data + ' } ');
        return ' ( ' + this.name + ', { ' +  this.data + ' } ';
    }
}