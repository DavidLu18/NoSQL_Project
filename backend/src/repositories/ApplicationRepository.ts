import { Application, ApplicationStatus, ApplicationFilters } from '@ats/shared';
import { BaseRepository } from './BaseRepository';
import { database } from '../config/database';

export class ApplicationRepository extends BaseRepository<Application> {
  constructor() {
    super('applications');
  }

  async findByJob(jobId: string, limit: number = 100): Promise<Application[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT applications.* 
      FROM \`${bucketName}\`.main.applications 
      WHERE jobId = $jobId
      ORDER BY appliedAt DESC
      LIMIT $limit
    `;
    return this.query(queryString, { jobId, limit });
  }

  async findByCandidate(candidateId: string, limit: number = 100): Promise<Application[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT applications.* 
      FROM \`${bucketName}\`.main.applications 
      WHERE candidateId = $candidateId
      ORDER BY appliedAt DESC
      LIMIT $limit
    `;
    return this.query(queryString, { candidateId, limit });
  }

  async findByStatus(status: ApplicationStatus, limit: number = 100): Promise<Application[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT applications.* 
      FROM \`${bucketName}\`.main.applications 
      WHERE status = $status
      ORDER BY appliedAt DESC
      LIMIT $limit
    `;
    return this.query(queryString, { status, limit });
  }

  async search(filters: ApplicationFilters): Promise<{ applications: Application[]; total: number }> {
    const bucketName = database.getBucket().name;
    const conditions: string[] = [];
    const params: any = {};

    if (filters.jobId) {
      conditions.push('jobId = $jobId');
      params.jobId = filters.jobId;
    }

    if (filters.candidateId) {
      conditions.push('candidateId = $candidateId');
      params.candidateId = filters.candidateId;
    }

    if (filters.status) {
      conditions.push('status = $status');
      params.status = filters.status;
    }

    if (filters.source) {
      conditions.push('source = $source');
      params.source = filters.source;
    }

    if (filters.dateFrom) {
      conditions.push('appliedAt >= $dateFrom');
      params.dateFrom = filters.dateFrom;
    }

    if (filters.dateTo) {
      conditions.push('appliedAt <= $dateTo');
      params.dateTo = filters.dateTo;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    params.limit = limit;
    params.offset = offset;

    const queryString = `
      SELECT applications.* 
      FROM \`${bucketName}\`.main.applications 
      ${whereClause}
      ORDER BY appliedAt DESC
      LIMIT $limit OFFSET $offset
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM \`${bucketName}\`.main.applications 
      ${whereClause}
    `;

    const [applications, countResult] = await Promise.all([
      this.query(queryString, params),
      this.query(countQuery, params),
    ]);

    return {
      applications,
      total: (countResult[0] as any)?.total || 0,
    };
  }

  async getStatusCounts(jobId?: string): Promise<Record<ApplicationStatus, number>> {
    const bucketName = database.getBucket().name;
    const whereClause = jobId ? 'WHERE jobId = $jobId' : '';
    const queryString = `
      SELECT status, COUNT(*) as count 
      FROM \`${bucketName}\`.main.applications 
      ${whereClause}
      GROUP BY status
    `;
    const params = jobId ? { jobId } : {};
    const results = await this.query(queryString, params);
    
    const counts: Record<string, number> = {};
    results.forEach((row: any) => {
      counts[row.status] = row.count;
    });
    
    return counts as Record<ApplicationStatus, number>;
  }
}

