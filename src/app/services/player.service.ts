import { Injectable } from '@angular/core';

import { auth } from 'firebase/app'
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference, DocumentSnapshot } from '@angular/fire/firestore'

import { Observable, of } from 'rxjs';
import { switchMap, map, take, tap } from 'rxjs/operators'
import { Player } from '../models'
import { TeamsService } from '../model/teams'
import { TournamentsService } from '../model/tournaments'

interface PlayerId extends Player {
	id: DocumentReference;
}

@Injectable({
	providedIn: 'root'
})
export class PlayerService {
	user$: Observable<PlayerId>;
	teams: TeamsService;
	tournaments: TournamentsService;

	constructor(
		private afAuth: AngularFireAuth,
		private afs: AngularFirestore,
	) {
		this.teams = new TeamsService(afs);
		this.tournaments = new TournamentsService(afs);
		this.user$ = this.afAuth.authState.pipe(
			switchMap(user => {
				if (user) {
					this.teams.userUpdate(this.userRef(user).ref);
					this.tournaments.userUpdate(this.userRef(user).ref);
					return this.userRef(user)
						.snapshotChanges()
						.pipe(map(action => {
							return { id: action.payload.ref, ...action.payload.data() };
						}));
				} else {
					this.teams.userUpdate(null);
					this.tournaments.userUpdate(null);
					return of(null);
				}
			})
		)
	}

	private userRef(user: firebase.User) {
		return this.afs.collection("players").doc<Player>(user.uid);
	}

	private updateUserData(user: firebase.User) {
		return this.userRef(user).set({
			name: user.displayName,
			email: user.email,
			photoURL: user.photoURL
		}, {merge: true});
	}

	async googleSignIn() {
		const provider = new auth.GoogleAuthProvider();
		const credential = await this.afAuth.signInWithPopup(provider);
		return this.updateUserData(credential.user);
	}

	public signOut() {
		return this.afAuth.signOut();
	}

	public updateIgn(ign: string) {
		this.user$.pipe(
			take(1),
			map(player => 
				player.id.set({
					ign: ign
				}, {merge: true})
			)
		).subscribe();
	}

	public updateTeams(teamRef: DocumentReference) {
		this.user$.pipe(
			take(1),
			map(player => {
				player.id.collection("teams").doc(teamRef.id).set({
					ref: teamRef
				})
			})
		).subscribe();
	}

}
