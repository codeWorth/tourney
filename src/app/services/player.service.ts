import { Injectable } from '@angular/core';

import { auth } from 'firebase/app'
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference, DocumentSnapshot } from '@angular/fire/firestore'

import { Observable, of } from 'rxjs';
import { switchMap, map, take, tap } from 'rxjs/operators'
import { Player, Team, DocRef } from '../model/models'
import { PlayerTeams } from '../model/queries/player.teams';
import { PlayerTournaments } from '../model/queries/player.tournaments';
import { PlayerInvites } from '../model/queries/player.invites';

interface PlayerId extends Player {
	id: DocumentReference;
}

@Injectable({
	providedIn: 'root'
})
export class PlayerService {
	user$: Observable<PlayerId>;
	invites: PlayerInvites;
	teams: PlayerTeams;
	tournaments: PlayerTournaments;

	constructor(
		private afAuth: AngularFireAuth,
		private afs: AngularFirestore,
	) {
		this.teams = new PlayerTeams(afs);
		this.tournaments = new PlayerTournaments(afs);
		this.invites = new PlayerInvites(afs);
		this.user$ = this.afAuth.authState.pipe(
			switchMap(user => {
				if (user) {
					this.teams.update(this.userRef(user).ref);
					this.tournaments.update(this.userRef(user).ref);
					this.invites.update(this.userRef(user).ref);
					return this.userRef(user)
						.snapshotChanges()
						.pipe(map(action => {
							return { id: action.payload.ref, ...action.payload.data() };
						}));
				} else {
					this.teams.update(null);
					this.tournaments.update(null);
					return of(null);
				}
			})
		)
	}

	private userRef(user: firebase.User) {
		return this.afs.collection("players").doc<Player>(user.uid);
	}

	private updateUserData(user: firebase.User): Promise<any> {
		return new Promise((resFunc, errFunc) =>
			this.userRef(user)
				.set({
					name: user.displayName,
					email: user.email,
					photoURL: user.photoURL
				}, {merge: true})
				.then(_ =>
					this.userRef(user)
						.collection("invites")
						.doc<DocRef>(user.email)
						.set({
							ref: this.afs.collection("invites").doc(user.email).ref
						})
						.then(resFunc)
						.catch(errFunc)
				)
				.catch(errFunc)
		);
	}

	async googleSignIn() {
		const provider = new auth.GoogleAuthProvider();
		const credential = await this.afAuth.signInWithPopup(provider);
		return this.updateUserData(credential.user);
	}

	public signOut() {
		return this.afAuth.signOut();
	}

	public updateIgn(ign: string): Promise<any> {
		return new Promise((resFunc, errFunc) =>
			this.user$.pipe(
				take(1),
				map(player => 
					player.id.set({
						ign: ign
					}, {merge: true})
					.then(resFunc)
					.catch(errFunc)
				)
			).subscribe()
		);
	}

	public leaveTeam(teamRef: DocumentReference): Promise<any> {
		return new Promise((resFunc, errFunc) => 
			this.user$.pipe(
				take(1),
				map(player =>
					player.id
						.collection("teams")
						.doc(teamRef.id)
						.delete()
						.then(_ =>
							teamRef.collection("players")
								.doc(player.id.id)
								.delete()
								.then(_ => resFunc(null))
						)
				)
			).subscribe()
		);
	}

}
