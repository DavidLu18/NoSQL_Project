import { Candidate, CandidateSource, CandidateFilters } from '@ats/shared';
import { BaseRepository } from './BaseRepository';
import { database } from '../config/database';

export class CandidateRepository extends BaseRepository<Candidate> {
  constructor() {
    super('candidates');
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    try {
      const bucketName = database.getBucket().name;
      const queryString = `
        SELECT candidates.* 
        FROM \`${bucketName}\`.main.candidates 
        WHERE email = $email
        LIMIT 1
      `;
      const candidates = await this.query(queryString, { email });
      return candidates[0] || null;
    } catch (error) {
      return null;
    }
  }

  async findBySource(source: CandidateSource, limit: number = 100): Promise<Candidate[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT candidates.* 
      FROM \`${bucketName}\`.main.candidates 
      WHERE source = $source
      ORDER BY createdAt DESC
      LIMIT $limit
    `;
    return this.query(queryString, { source, limit });
  }

  async search(filters: CandidateFilters): Promise<{ candidates: Candidate[]; total: number }> {
    const bucketName = database.getBucket().name;
    const conditions: string[] = [];
    const params: any = {};

    if (filters.source) {
      conditions.push('source = $source');
      params.source = filters.source;
    }

    if (filters.skills && filters.skills.length > 0) {
      conditions.push('ANY skill IN skills SATISFIES skill IN $skills END');
      params.skills = filters.skills;
    }

    if (filters.experienceMin !== undefined) {
      conditions.push('experienceYears >= $experienceMin');
      params.experienceMin = filters.experienceMin;
    }

    if (filters.experienceMax !== undefined) {
      conditions.push('experienceYears <= $experienceMax');
      params.experienceMax = filters.experienceMax;
    }

    if (filters.search) {
      conditions.push(`(
        LOWER(firstName) LIKE $search OR 
        LOWER(lastName) LIKE $search OR 
        LOWER(email) LIKE $search OR
        LOWER(currentTitle) LIKE $search OR
        LOWER(currentCompany) LIKE $search
      )`);
      params.search = `%${filters.search.toLowerCase()}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    params.limit = limit;
    params.offset = offset;

    const queryString = `
      SELECT candidates.* 
      FROM \`${bucketName}\`.main.candidates 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT $limit OFFSET $offset
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM \`${bucketName}\`.main.candidates 
      ${whereClause}
    `;

    const [candidates, countResult] = await Promise.all([
      this.query(queryString, params),
      this.query(countQuery, params),
    ]);

    return {
      candidates,
      total: (countResult[0] as any)?.total || 0,
    };
  }
}

