import { DocumentReference } from '@angular/fire/firestore/interfaces';

export interface DocRef { // DOC REFS SHOULD NEVER BE MODIFIED!
	ref: DocumentReference;
}		


export interface Player {
	name: string;
	email: string;
	photoURL: string;
	ign?: string;
	// teams: DocRef[]					// <Team>
	// invites: DocRef[1]				
}
		

export interface Team {
	name: string;
	captain: DocumentReference;			// <Player>
	// players: DocumentReference[]		// <Player>
	// tournaments: DocumentReference[]	// <Tournament>
}


// invites/{email}/teams/DocRef


export interface Tournament {
	name: string;
	format: string;
	owner: DocumentReference; 			// <Player>
	minPlayers: number;					//	minimum number of players per team 
	// teams: DocumentReference[];
	// records: TeamRecord[]

	// bracketGroups: DocumentReference[]	// <BracketSeriesGroup>
}
export interface TournamentPlayer {	// id of <Player>
	team: DocumentReference;		// <Team>
	// series: DocumentReference[];		// <Series>
}
export interface TeamRecord {		// id of <Team>
	gameWins: number;
	gameLosses: number;
	seriesWins: number;
	seriesLosses: number;

	group?: DocumentReference;		// <BracketSeriesGroup>
}
export interface BracketSeriesGroup {
	name: string;
	final: DocumentReference		// <BracketSeriesItem>
}
export interface BracketSeriesItem {// id of <Series>
	teamASource: DocumentReference;	// <BracketSeriesItem> or <Team>
	teamBSource: DocumentReference;	// <BracketSeriesItem> or <Team>
	winnerDest: DocumentReference;	// <BracketSeriesItem>
	loserDest?: DocumentReference;	// <BracketSeriesItem> (null if loss = eliminated)
}

export interface Series {
	teamA: DocumentReference;		// <Team>
	teamB: DocumentReference;		// <Team>
	teamAStatus: number;
	teamBStatus: number;
	scores: Score[];
}
interface Score {
	teamA: number;
	teamB: number;
}