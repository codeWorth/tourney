import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { ReplaySubject } from 'rxjs';
import { QueryInterface, QueryBuilder } from '../query';
import { QueryManager } from '../query.manager';
import { Team, DocRef } from '../models';

export class PlayerInvites extends QueryManager<Team> {
	private teams$: ReplaySubject<Map<string, Team>>

	constructor(private fs: AngularFirestore) { 
		super();
		this.teams$ = new ReplaySubject(1);
	}

	public subject$(): ReplaySubject<Map<string, Team>> {
		return this.teams$;
	}

	protected queryBuilder(user: DocumentReference): QueryInterface<Team> {
		return QueryBuilder<Team>(
			this.teams$,
			this.fs.doc(user.path).collection<DocRef>("invites"),
			[ref => this.fs.doc(ref.path).collection<DocRef>("teams")],
			ref => this.fs.doc<Team>(ref.path)
		);
	}

	public acceptTeam(teamKey: string) {
		if (!this.getRef()) {
			console.error("Must be logged in to accept team invite");
			return;
		}
		this.fs.collection("teams")
			.doc(teamKey)
			.collection("players")
			.doc<DocRef>(this.getRef().id)
			.set({ref: this.getRef()});
		this.fs.doc(this.getRef().path)
			.collection("teams")
			.doc<DocRef>(teamKey)
			.set({
				ref: this.fs.collection("teams").doc(teamKey).ref
			});
		this.getRef().collection("invites")
			.get()
			.then(adds => adds.forEach(address => 
				this.fs.doc(address.data().ref.path).ref
					.collection("teams")
					.doc(teamKey)
					.delete()
			));
	}

	public rejectTeam(teamKey: string) {
		if (!this.getRef()) {
			console.error("Must be logged in to reject team invite");
			return;
		}
		this.getRef().collection("invites")
			.get()
			.then(adds => adds.forEach(address => 
				this.fs.doc(address.data().ref.path).ref
					.collection("teams")
					.doc(teamKey)
					.delete()
			));
	}

}