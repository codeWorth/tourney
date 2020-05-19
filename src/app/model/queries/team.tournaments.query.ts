import { ReplaySubject } from 'rxjs';
import { QueryManager } from '../query.manager';
import { Tournament, DocRef } from '../models';
import { AngularFirestore } from '@angular/fire/firestore/firestore';
import { DocumentReference } from '@angular/fire/firestore/interfaces';
import { QueryInterface, QueryBuilder } from '../query';

export class TeamTournaments extends QueryManager<Tournament> {
	private tournaments$: ReplaySubject<Map<string, Tournament>>;

	constructor(private fs: AngularFirestore) {
		super();
		this.tournaments$ = new ReplaySubject(1);
	}

	public subject$(): ReplaySubject<Map<string, Tournament>> {
		return this.tournaments$;
	}

	protected queryBuilder(team: DocumentReference): QueryInterface<Tournament> {
		return QueryBuilder<Tournament>(
			this.tournaments$,
			this.fs.doc(team.path).collection<DocRef>("tournaments"),
			[],
			ref => this.fs.doc<Tournament>(ref.path)
		);
	}

}