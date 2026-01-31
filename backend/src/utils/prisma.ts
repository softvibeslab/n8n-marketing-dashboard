/**
 * ===========================================
 * Prisma Client Singleton
 * ===========================================
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton
 */
class PrismaClientSingleton {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }

    return PrismaClientSingleton.instance;
  }
}

export const prisma = PrismaClientSingleton.getInstance();

/**
 * Cleanup function for testing
 */
export async function cleanupPrisma(): Promise<void> {
  await prisma.$disconnect();
}
