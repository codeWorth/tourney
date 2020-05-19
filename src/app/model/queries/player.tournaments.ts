import { AngularFirestore, DocumentReference } from '@angular/fire/firestore'
import { ReplaySubject } from 'rxjs';
import { QueryInterface, QueryBuilder } from '../query';
import { QueryManager } from '../query.manager';
import { Tournament, DocRef } from '../models';


export class PlayerTournaments extends QueryManager<Tournament> {
	private tournaments$: ReplaySubject<Map<string, Tournament>>

	constructor(private fs: AngularFirestore) { 
		super();
		this.tournaments$ = new ReplaySubject(1);
	}

	public subject$(): ReplaySubject<Map<string, Tournament>> {
		return this.tournaments$;
	}

	protected queryBuilder(user: DocumentReference): QueryInterface<Tournament> {
		return QueryBuilder<Tournament>(
			this.tournaments$,
			this.fs.doc(user.path).collection<DocRef>("teams"),
			[ref => this.fs.doc(ref.path).collection<DocRef>("tournaments")],
			ref => this.fs.doc<Tournament>(ref.path)
		);
	}

}
