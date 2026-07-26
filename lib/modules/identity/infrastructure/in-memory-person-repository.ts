import type { PersonId } from "../domain/identifiers";
import type { Person } from "../domain/person";
import type { PersonRepository } from "../application/person-repository";

/** In-memory PersonRepository — not for production. */
export class InMemoryPersonRepository implements PersonRepository {
  private readonly byId = new Map<string, Person>();

  async findById(id: PersonId): Promise<Person | null> {
    return this.byId.get(id) ?? null;
  }

  async save(person: Person): Promise<void> {
    this.byId.set(person.id, person);
  }
}
