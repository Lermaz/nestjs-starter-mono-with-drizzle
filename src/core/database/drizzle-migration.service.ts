import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import {
  DRIZZLE_DB,
  DrizzleDb,
  resolveDrizzleMigrationsFolder,
} from './drizzle.provider';

/**
 * Applies pending Drizzle SQL migrations on application startup.
 */
@Injectable()
export class DrizzleMigrationService implements OnModuleInit {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb | null) {}

  async onModuleInit(): Promise<void> {
    if (!this.db) {
      return;
    }
    await migrate(this.db, {
      migrationsFolder: resolveDrizzleMigrationsFolder(),
    });
  }
}
