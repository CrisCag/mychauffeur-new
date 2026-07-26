import type { PersonId, UserId } from "../domain/identifiers";
import type { User } from "../domain/user";
import type { UserRepository } from "../application/user-repository";

/** In-memory UserRepository — not for production. */
export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();

  async findById(id: UserId): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  async findByPersonId(personId: PersonId): Promise<User | null> {
    for (const user of this.byId.values()) {
      if (user.personId === personId) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.byId.set(user.id, user);
  }
}
