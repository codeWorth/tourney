import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { ReplaySubject } from 'rxjs';
import { QueryInterface, QueryBuilder } from '../query';
import { QueryManager } from '../query.manager';
import { DocRef, Team } from '../models';

export class PlayerTeams extends QueryManager<Team> {	
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
			this.fs.doc(user.path).collection<DocRef>("teams"),
			[],
			ref => this.fs.doc<Team>(ref.path)
		)
	}

	public createTeam(name: string) {
		if (!this.getRef()) {
			console.error("Must be logged in to create team");
			return;
		}
		this.fs
			.collection<Team>("teams")
			.add({
				name: name,
				captain: this.getRef()
			})
			.then(id => {
				this.fs.doc(id.path)
					.collection("players")
					.doc(this.getRef().id)
					.set({ref: this.getRef()});
				this.fs.doc(this.getRef().path)
					.collection<DocRef>("teams")
					.doc<DocRef>(id.id)
					.set({ref: id});
			})
	}
}
