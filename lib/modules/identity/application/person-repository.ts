import type { PersonId } from "../domain/identifiers";
import type { Person } from "../domain/person";

export interface PersonRepository {
  findById(id: PersonId): Promise<Person | null>;
  save(person: Person): Promise<void>;
}
