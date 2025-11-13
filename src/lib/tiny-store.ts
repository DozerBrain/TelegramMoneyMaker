// Lightweight reactive store (no deps)
export type Unsubscribe = () => void;

export class TinyStore<T> {
  private value: T;
  private subs = new Set<(v: T) => void>();

  constructor(initial: T) {
    this.value = initial;
  }
  get() { return this.value; }
  set(next: T) {
    this.value = next;
    this.subs.forEach(fn => fn(next));
  }
  update(mutator: (v: T) => T) {
    this.set(mutator(this.value));
  }
  subscribe(fn: (v: T) => void): Unsubscribe {
    this.subs.add(fn);
    fn(this.value);
    return () => this.subs.delete(fn);
  }
}
