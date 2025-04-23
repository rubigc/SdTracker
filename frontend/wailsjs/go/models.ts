export namespace app {
	
	export class Player {
	    Name: string;
	    OTS: string;
	    IsWinner: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Player(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.OTS = source["OTS"];
	        this.IsWinner = source["IsWinner"];
	    }
	}
	export class MatchHistory {
	    Timestamp: string;
	    Player1: Player;
	    Player2: Player;
	    ReplayFile: string;
	
	    static createFrom(source: any = {}) {
	        return new MatchHistory(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Timestamp = source["Timestamp"];
	        this.Player1 = this.convertValues(source["Player1"], Player);
	        this.Player2 = this.convertValues(source["Player2"], Player);
	        this.ReplayFile = source["ReplayFile"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

