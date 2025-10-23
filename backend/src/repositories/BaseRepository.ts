import { Collection } from 'couchbase';
import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export abstract class BaseRepository<T> {
  protected collection: Collection;

  constructor(collectionName: string) {
    this.collection = database.getCollection(collectionName);
  }

  async create(id: string, data: T): Promise<T> {
    try {
      await this.collection.insert(id, data);
      return data;
    } catch (error: any) {
      logger.error(`Error creating document in ${this.collection.name}:`, error);
      if (error.message?.includes('exists')) {
        throw new AppError('Document already exists', 409);
      }
      throw new AppError('Failed to create document', 500);
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.collection.get(id);
      return result.content as T;
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return null;
      }
      logger.error(`Error finding document in ${this.collection.name}:`, error);
      throw new AppError('Failed to retrieve document', 500);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        throw new AppError('Document not found', 404);
      }
      const updated = { ...existing, ...data };
      await this.collection.replace(id, updated);
      return updated as T;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(`Error updating document in ${this.collection.name}:`, error);
      throw new AppError('Failed to update document', 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.remove(id);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        throw new AppError('Document not found', 404);
      }
      logger.error(`Error deleting document in ${this.collection.name}:`, error);
      throw new AppError('Failed to delete document', 500);
    }
  }

  async query(queryString: string, params?: any): Promise<T[]> {
    try {
      const cluster = database.getCluster();
      const result = await cluster.query(queryString, { parameters: params });
      return result.rows.map((row: any) => row[this.collection.name] || row);
    } catch (error) {
      logger.error(`Error querying ${this.collection.name}:`, error);
      throw new AppError('Query failed', 500);
    }
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<T[]> {
    const bucketName = database.getBucket().name;
    const scopeName = 'main';
    const queryString = `
      SELECT ${this.collection.name}.* 
      FROM \`${bucketName}\`.\`${scopeName}\`.\`${this.collection.name}\` 
      LIMIT $limit OFFSET $offset
    `;
    return this.query(queryString, { limit, offset });
  }

  async count(): Promise<number> {
    try {
      const bucketName = database.getBucket().name;
      const scopeName = 'main';
      const queryString = `
        SELECT COUNT(*) as count 
        FROM \`${bucketName}\`.\`${scopeName}\`.\`${this.collection.name}\`
      `;
      const cluster = database.getCluster();
      const result = await cluster.query(queryString);
      return result.rows[0]?.count || 0;
    } catch (error) {
      logger.error(`Error counting documents in ${this.collection.name}:`, error);
      return 0;
    }
  }
}

