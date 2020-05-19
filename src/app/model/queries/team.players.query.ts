import { ReplaySubject } from 'rxjs';
import { QueryManager } from '../query.manager';
import { Tournament, DocRef, Player } from '../models';
import { AngularFirestore } from '@angular/fire/firestore/firestore';
import { DocumentReference } from '@angular/fire/firestore/interfaces';
import { QueryInterface, QueryBuilder } from '../query';

export class TeamPlayers extends QueryManager<Player> {
	private players$: ReplaySubject<Map<string, Player>>;

	constructor(private fs: AngularFirestore) {
		super();
		this.players$ = new ReplaySubject(1);
	}

	public subject$(): ReplaySubject<Map<string, Player>> {
		return this.players$;
	}

	protected queryBuilder(team: DocumentReference): QueryInterface<Player> {
		return QueryBuilder<Player>(
			this.players$,
			this.fs.doc(team.path).collection<DocRef>("players"),
			[],
			ref => this.fs.doc<Player>(ref.path)
		);
	}

}