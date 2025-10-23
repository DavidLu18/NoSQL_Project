import { User, UserRole } from '@ats/shared';
import { BaseRepository } from './BaseRepository';
import { database } from '../config/database';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const bucketName = database.getBucket().name;
      const queryString = `
        SELECT users.* 
        FROM \`${bucketName}\`.main.users 
        WHERE email = $email
        LIMIT 1
      `;
      const users = await this.query(queryString, { email });
      return users[0] || null;
    } catch (error) {
      return null;
    }
  }

  async findByRole(role: UserRole, limit: number = 100): Promise<User[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT users.* 
      FROM \`${bucketName}\`.main.users 
      WHERE role = $role
      LIMIT $limit
    `;
    return this.query(queryString, { role, limit });
  }

  async search(searchTerm: string, limit: number = 50): Promise<User[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT users.* 
      FROM \`${bucketName}\`.main.users 
      WHERE LOWER(firstName) LIKE $searchTerm 
         OR LOWER(lastName) LIKE $searchTerm 
         OR LOWER(email) LIKE $searchTerm
      LIMIT $limit
    `;
    const term = `%${searchTerm.toLowerCase()}%`;
    return this.query(queryString, { searchTerm: term, limit });
  }
}

