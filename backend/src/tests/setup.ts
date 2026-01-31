/**
 * ===========================================
 * Test Setup
 * ===========================================
 */

import { beforeAll, afterAll } from '@jest/globals';
import { cleanupPrisma } from '../utils/prisma';

/**
 * Global test setup
 */
beforeAll(async () => {
  // Setup test database, mocks, etc.
});

/**
 * Global test cleanup
 */
afterAll(async () => {
  await cleanupPrisma();
});
