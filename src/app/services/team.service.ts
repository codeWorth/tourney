import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DocumentReference } from '@angular/fire/firestore/interfaces'
import { TeamPlayers } from '../model/queries/team.players.query';
import { TeamTournaments } from '../model/queries/team.tournaments.query';
import { Team, DocRef } from '../model/models';

@Injectable({
	providedIn: 'root'
})
export class TeamService {

	public teamRef: DocumentReference;
	public name: string;
	public captain: DocumentReference;
	public players: TeamPlayers;
	public tournaments: TeamTournaments;

	constructor(private fs: AngularFirestore) {
		this.players = new TeamPlayers(fs);
		this.tournaments = new TeamTournaments(fs);
	}

	public select(teamRef: DocumentReference, team: Team) {
		this.teamRef = teamRef;
		this.name = team.name;
		this.captain = team.captain;
		this.players.update(teamRef);
		this.tournaments.update(teamRef);
	}

	public removeTeam(): Promise<any> {
		return new Promise((resFunc, errFunc) => 
			this.teamRef.collection("tournaments")
				.get().then(tourneys => {
					if (tourneys.size == 0) {
						this.teamRef.collection("players")
							.get().then(players => players.forEach(player => {
								let playerRef: DocumentReference = player.data().ref;
								playerRef.collection("teams").doc(this.teamRef.id).delete();
							}))
							.then(_ => {
								this.teamRef.delete();
								this.teamRef.collection("players")
									.get()
									.then(players => players.forEach(player =>
										player.ref.delete()
									))
									.catch(errFunc)
							})
							.catch(errFunc)
							.then(_ => resFunc(null));
					} else {
						errFunc("This team cannot be deleted because it is more than zero tournaments (" + tourneys.size + ")");
					}
				})
				.catch(errFunc)
		);
	} 

	public invitePlayer(email: string) {
		return this.fs.collection("invites")
			.doc(email)
			.collection("teams")
			.doc<DocRef>(this.teamRef.id)
			.set({ref: this.teamRef});
	}

}
