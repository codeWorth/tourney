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
}
		

export interface Team {
	name: string;
	players: DocumentReference[]		// <Player>
	// tournaments: DocumentReference[]	// <Tournament>
}


export interface Tournament {
	name: string;
	format: string;
	owner: DocumentReference; 				// <Player>
	// teams: DocumentReference[];
	// players: TournamentPlayer[]		
	// records: TeamRecord[]

	// bracketGroups: DocumentReference[]	// <BracketSeriesGroup>
}
export interface TournamentPlayer {	// id of <Player>
	team: DocumentReference;		// <Team>
	series: DocumentReference[];		// <Series>
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