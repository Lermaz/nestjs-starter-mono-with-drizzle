import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE_DB, DrizzleDb } from '../drizzle.provider';
import { DatabaseHealthPort } from '../ports/database-health.port';

/**
 * Drizzle implementation of database connectivity checks.
 */
@Injectable()
export class DrizzleDatabaseHealthAdapter implements DatabaseHealthPort {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb | null) {}

  async checkConnectivity(): Promise<boolean> {
    if (!this.db) {
      return false;
    }
    try {
      await this.db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }
}
