import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../drizzle.provider';
import type { DrizzleDb } from '../drizzle.provider';
import { DatabaseHealthPort } from '../ports/database-health.port';

/**
 * Drizzle implementation of database connectivity checks.
 */
@Injectable()
export class DrizzleDatabaseHealthAdapter implements DatabaseHealthPort {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async checkConnectivity(): Promise<boolean> {
    try {
      await this.db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }
}
