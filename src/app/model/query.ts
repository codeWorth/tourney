import { Subscription, Observable, Subject, ReplaySubject } from 'rxjs';
import { DocumentChangeAction, DocumentReference } from '@angular/fire/firestore/interfaces';
import { AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore/public_api';
import { DocRef } from './models';

export interface QueryInterface<T> {
	id: string;
	parent: QueryInterface<T>;

	remove(): void;
	childRemoved(child: QueryInterface<T>): void;
}

export function QueryBuilder<T>(
	subject: ReplaySubject<Map<string, T>>,
	start: AngularFirestoreCollection<DocRef>,
	funcs: ((ref: DocumentReference) => AngularFirestoreCollection<DocRef>)[],
	end: (ref: DocumentReference) => AngularFirestoreDocument<T>
): QueryInterface<T> {
	let data: Map<string, T> = new Map();
	let topQuery: QueryStep<T> = new QueryStep<T>(
		start.stateChanges(),
		build<T>(funcs, end, data, subject)
	);
	return topQuery;
}

function build<T>(
	funcs: ((ref: DocumentReference) => AngularFirestoreCollection<DocRef>)[],
	finisher: (ref: DocumentReference) => AngularFirestoreDocument<T>,
	data: Map<string, T>,
	subject: Subject<Map<string, T>>,
	index: number = 0
): (ref: DocumentReference) => QueryInterface<T> {
	if (index < funcs.length) {
		let func = funcs[index];
		return ref => new QueryStep<T>(
			func(ref).stateChanges(),
			build(funcs, finisher, data, subject, index+1)
		);
	} else {
		return ref => new QueryResult(
			ref.id,
			finisher(ref).valueChanges(),
			data,
			subject
		);
	}
}

class QueryStep<T> implements QueryInterface<T> {
	id: string;
	parent: QueryInterface<T>;
	index: Map<string, QueryInterface<T>>;
	subscription: Subscription; 

	constructor(
		obs: Observable<DocumentChangeAction<DocRef>[]>,
		nextStep: (ref: DocumentReference) => QueryInterface<T>
	) {
		this.index = new Map();
		this.subscription = obs.subscribe(changes => changes.forEach(change => {
			let ref = change.payload.doc.data().ref;
			switch(change.type) {
				case "added":
					let qs = nextStep(ref);
					qs.id = ref.id;
					qs.parent = this;
					this.index.set(ref.id, qs);
					break;
				case "removed":
					this.index.get(ref.id).remove();
					break;
				case "modified":
					console.error("DocRef modified, illegal action!\n", ref);
					break;
			}
		}));
	}

	public remove() {
		this.subscription.unsubscribe();
		this.index.forEach(q => q.remove());
		if (this.parent) {
			this.parent.childRemoved(this);
		}
	}

	public childRemoved(child: QueryInterface<T>) {
		this.index.delete(child.id);
	}

}

class QueryResult<T> implements QueryInterface<T> {
	id: string;
	parent: QueryInterface<T>;
	subscription: Subscription;
	data: Map<string, T>;
	subject: Subject<Map<string, T>>;

	constructor(
		id: string,
		obs: Observable<T>,
		data: Map<string, T>,
		subject: Subject<Map<string, T>>
	) {
		this.id = id;
		this.data = data;
		this.subject = subject;
		this.subscription = obs.subscribe(doc => {
			data.set(this.id, doc);
			this.subject.next(this.data);
		});
	}

	remove() {
		this.subscription.unsubscribe();
		this.data.delete(this.id);
		this.subject.next(this.data);
		if (this.parent) {
			this.parent.childRemoved(this);
		}
	}

	childRemoved(child: QueryStep<T>) {
		console.error("QueryResults should not have children!\n", this)
	}

}

