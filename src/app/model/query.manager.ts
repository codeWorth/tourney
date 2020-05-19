import { DocumentReference } from '@angular/fire/firestore';
import { ReplaySubject } from 'rxjs';
import { QueryInterface } from './query';

export abstract class QueryManager<T> {
	private query: QueryInterface<T>;
	private ref: DocumentReference;

	public abstract subject$(): ReplaySubject<Map<string, T>>;
	protected abstract queryBuilder(ref: DocumentReference): QueryInterface<T>; 

	public update(ref: DocumentReference) {
		if (ref) {
			if (this.ref && this.ref.path == ref.path) {
				return;
			}
			this.ref = ref;
			if (this.query) this.query.remove();
			this.query = this.queryBuilder(this.ref);
		} else if (this.query) {
			this.ref = ref;
			this.query.remove();
		}
	}

	protected getRef(): DocumentReference {
		return this.ref;
	}

}