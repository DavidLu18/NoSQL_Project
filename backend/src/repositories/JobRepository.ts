import { Job, JobStatus, JobFilters } from '@ats/shared';
import { BaseRepository } from './BaseRepository';
import { database } from '../config/database';

export class JobRepository extends BaseRepository<Job> {
  constructor() {
    super('jobs');
  }

  async findByStatus(status: JobStatus, limit: number = 100): Promise<Job[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT jobs.* 
      FROM \`${bucketName}\`.main.jobs 
      WHERE status = $status
      ORDER BY createdAt DESC
      LIMIT $limit
    `;
    return this.query(queryString, { status, limit });
  }

  async findByRecruiter(recruiterId: string, limit: number = 100): Promise<Job[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT jobs.* 
      FROM \`${bucketName}\`.main.jobs 
      WHERE recruiterId = $recruiterId
      ORDER BY createdAt DESC
      LIMIT $limit
    `;
    return this.query(queryString, { recruiterId, limit });
  }

  async search(filters: JobFilters): Promise<{ jobs: Job[]; total: number }> {
    const bucketName = database.getBucket().name;
    const conditions: string[] = [];
    const params: any = {};

    if (filters.status) {
      conditions.push('status = $status');
      params.status = filters.status;
    }

    if (filters.type) {
      conditions.push('type = $type');
      params.type = filters.type;
    }

    if (filters.department) {
      conditions.push('department = $department');
      params.department = filters.department;
    }

    if (filters.location) {
      conditions.push('LOWER(location) LIKE $location');
      params.location = `%${filters.location.toLowerCase()}%`;
    }

    if (filters.experienceLevel) {
      conditions.push('experienceLevel = $experienceLevel');
      params.experienceLevel = filters.experienceLevel;
    }

    if (filters.recruiterId) {
      conditions.push('recruiterId = $recruiterId');
      params.recruiterId = filters.recruiterId;
    }

    if (filters.search) {
      conditions.push('(LOWER(title) LIKE $search OR LOWER(description) LIKE $search OR LOWER(department) LIKE $search)');
      params.search = `%${filters.search.toLowerCase()}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    params.limit = limit;
    params.offset = offset;

    const queryString = `
      SELECT jobs.* 
      FROM \`${bucketName}\`.main.jobs 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT $limit OFFSET $offset
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM \`${bucketName}\`.main.jobs 
      ${whereClause}
    `;

    const [jobs, countResult] = await Promise.all([
      this.query(queryString, params),
      this.query(countQuery, params),
    ]);

    return {
      jobs,
      total: (countResult[0] as any)?.total || 0,
    };
  }
}

