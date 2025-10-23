import { Interview, InterviewStatus, InterviewFilters } from '@ats/shared';
import { BaseRepository } from './BaseRepository';
import { database } from '../config/database';

export class InterviewRepository extends BaseRepository<Interview> {
  constructor() {
    super('interviews');
  }

  async findByApplication(applicationId: string): Promise<Interview[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT interviews.* 
      FROM \`${bucketName}\`.main.interviews 
      WHERE applicationId = $applicationId
      ORDER BY scheduledDate ASC
    `;
    return this.query(queryString, { applicationId });
  }

  async findByCandidate(candidateId: string): Promise<Interview[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT interviews.* 
      FROM \`${bucketName}\`.main.interviews 
      WHERE candidateId = $candidateId
      ORDER BY scheduledDate ASC
    `;
    return this.query(queryString, { candidateId });
  }

  async findByInterviewer(interviewerId: string, dateFrom?: string, dateTo?: string): Promise<Interview[]> {
    const bucketName = database.getBucket().name;
    let conditions = `ANY interviewer IN interviewers SATISFIES interviewer = $interviewerId END`;
    
    const params: any = { interviewerId };

    if (dateFrom) {
      conditions += ' AND scheduledDate >= $dateFrom';
      params.dateFrom = dateFrom;
    }

    if (dateTo) {
      conditions += ' AND scheduledDate <= $dateTo';
      params.dateTo = dateTo;
    }

    const queryString = `
      SELECT interviews.* 
      FROM \`${bucketName}\`.main.interviews 
      WHERE ${conditions}
      ORDER BY scheduledDate ASC
    `;
    return this.query(queryString, params);
  }

  async findByDateRange(dateFrom: string, dateTo: string): Promise<Interview[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT interviews.* 
      FROM \`${bucketName}\`.main.interviews 
      WHERE scheduledDate >= $dateFrom AND scheduledDate <= $dateTo
      ORDER BY scheduledDate ASC
    `;
    return this.query(queryString, { dateFrom, dateTo });
  }

  async search(filters: InterviewFilters): Promise<{ interviews: Interview[]; total: number }> {
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

    if (filters.type) {
      conditions.push('type = $type');
      params.type = filters.type;
    }

    if (filters.dateFrom) {
      conditions.push('scheduledDate >= $dateFrom');
      params.dateFrom = filters.dateFrom;
    }

    if (filters.dateTo) {
      conditions.push('scheduledDate <= $dateTo');
      params.dateTo = filters.dateTo;
    }

    if (filters.interviewerId) {
      conditions.push('ANY interviewer IN interviewers SATISFIES interviewer = $interviewerId END');
      params.interviewerId = filters.interviewerId;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    params.limit = limit;
    params.offset = offset;

    const queryString = `
      SELECT interviews.* 
      FROM \`${bucketName}\`.main.interviews 
      ${whereClause}
      ORDER BY scheduledDate ASC
      LIMIT $limit OFFSET $offset
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM \`${bucketName}\`.main.interviews 
      ${whereClause}
    `;

    const [interviews, countResult] = await Promise.all([
      this.query(queryString, params),
      this.query(countQuery, params),
    ]);

    return {
      interviews,
      total: (countResult[0] as any)?.total || 0,
    };
  }
}

