import type { PersonId, UserId } from "../domain/identifiers";
import type { User } from "../domain/user";

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByPersonId(personId: PersonId): Promise<User | null>;
  save(user: User): Promise<void>;
}
