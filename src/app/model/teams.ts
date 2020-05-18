import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { ReplaySubject } from 'rxjs';
import { DocRef, Team } from '../models';
import { QueryInterface, QueryBuilder } from './query';
import { QueryManager } from './query.manager';

export class TeamsService extends QueryManager<Team> {	
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
			this.fs.doc(user.path).collection<DocRef>("teams").stateChanges(),
			[],
			ref => this.fs.doc<Team>(ref.path).valueChanges()
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
				players: [this.getRef()]
			})
			.then(id => this.fs.doc(this.getRef().path)
				.collection<DocRef>("teams")
				.doc(id.id)
				.set({
					ref: id
				})
			)
	}
}
