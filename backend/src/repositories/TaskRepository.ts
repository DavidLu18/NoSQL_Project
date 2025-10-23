import { Task, TaskStatus, TaskPriority } from '@ats/shared';
import { BaseRepository } from './BaseRepository';
import { database } from '../config/database';

export class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super('tasks');
  }

  async findByAssignee(assigneeId: string, status?: TaskStatus): Promise<Task[]> {
    const bucketName = database.getBucket().name;
    let whereClause = 'WHERE assigneeId = $assigneeId';
    const params: any = { assigneeId };

    if (status) {
      whereClause += ' AND status = $status';
      params.status = status;
    }

    const queryString = `
      SELECT tasks.* 
      FROM \`${bucketName}\`.main.tasks 
      ${whereClause}
      ORDER BY priority DESC, dueDate ASC
    `;
    return this.query(queryString, params);
  }

  async findOverdue(assigneeId?: string): Promise<Task[]> {
    const bucketName = database.getBucket().name;
    const now = new Date().toISOString();
    let whereClause = 'WHERE dueDate < $now AND status != $doneStatus AND status != $cancelledStatus';
    const params: any = { 
      now, 
      doneStatus: TaskStatus.DONE, 
      cancelledStatus: TaskStatus.CANCELLED 
    };

    if (assigneeId) {
      whereClause += ' AND assigneeId = $assigneeId';
      params.assigneeId = assigneeId;
    }

    const queryString = `
      SELECT tasks.* 
      FROM \`${bucketName}\`.main.tasks 
      ${whereClause}
      ORDER BY dueDate ASC
    `;
    return this.query(queryString, params);
  }

  async findByRelated(type: string, id: string): Promise<Task[]> {
    const bucketName = database.getBucket().name;
    const queryString = `
      SELECT tasks.* 
      FROM \`${bucketName}\`.main.tasks 
      WHERE relatedTo.type = $type AND relatedTo.id = $id
      ORDER BY createdAt DESC
    `;
    return this.query(queryString, { type, id });
  }
}

