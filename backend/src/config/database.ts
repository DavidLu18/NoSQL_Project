import * as couchbase from 'couchbase';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

class Database {
  private cluster: couchbase.Cluster | null = null;
  private bucket: couchbase.Bucket | null = null;
  private scope: couchbase.Scope | null = null;

  async connect(): Promise<void> {
    try {
      const connectionString = process.env.COUCHBASE_URL || 'couchbase://localhost';
      const username = process.env.COUCHBASE_USERNAME || 'Admin';
      const password = process.env.COUCHBASE_PASSWORD || '123456';

      logger.info(`Connecting to Couchbase at ${connectionString}...`);

      this.cluster = await couchbase.connect(connectionString, {
        username,
        password,
        timeouts: {
          kvTimeout: 10000,
          queryTimeout: 75000,
        },
      });

      const bucketName = process.env.COUCHBASE_BUCKET || 'ats_bucket';
      this.bucket = this.cluster.bucket(bucketName);
      this.scope = this.bucket.scope('main');

      // Verify connection by doing a simple ping
      await this.cluster.ping();

      logger.info('Successfully connected to Couchbase');
    } catch (error) {
      logger.error('Failed to connect to Couchbase:', error);
      throw error;
    }
  }

  getCluster(): couchbase.Cluster {
    if (!this.cluster) {
      throw new Error('Database not connected');
    }
    return this.cluster;
  }

  getBucket(): couchbase.Bucket {
    if (!this.bucket) {
      throw new Error('Database not connected');
    }
    return this.bucket;
  }

  getScope(): couchbase.Scope {
    if (!this.scope) {
      throw new Error('Database not connected');
    }
    return this.scope;
  }

  getCollection(name: string): couchbase.Collection {
    return this.getScope().collection(name);
  }

  async disconnect(): Promise<void> {
    if (this.cluster) {
      await this.cluster.close();
      logger.info('Disconnected from Couchbase');
    }
  }
}

export const database = new Database();

