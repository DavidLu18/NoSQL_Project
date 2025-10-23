import dotenv from 'dotenv';
dotenv.config();

import { database } from '../config/database';
import { logger } from '../utils/logger';

async function clearDatabase() {
  try {
    logger.info('🗑️  Clearing database...');

    await database.connect();

    const collections = [
      'users',
      'jobs',
      'candidates',
      'applications',
      'interviews',
      'tasks',
      'reports',
      'activities',
    ];

    const bucketName = database.getBucket().name;
    const cluster = database.getCluster();

    for (const collectionName of collections) {
      try {
        const query = `DELETE FROM \`${bucketName}\`.main.\`${collectionName}\``;
        await cluster.query(query);
        logger.info(`✅ Cleared collection: ${collectionName}`);
      } catch (error) {
        logger.error(`Failed to clear collection ${collectionName}:`, error);
      }
    }

    logger.info('✅ Database cleared successfully!');
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Clear database failed:', error);
    await database.disconnect();
    process.exit(1);
  }
}

clearDatabase();

