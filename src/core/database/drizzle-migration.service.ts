import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { DRIZZLE_DB, resolveDrizzleMigrationsFolder } from './drizzle.provider';
import type { DrizzleDb } from './drizzle.provider';

/**
 * Applies pending Drizzle SQL migrations on application startup.
 */
@Injectable()
export class DrizzleMigrationService implements OnModuleInit {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async onModuleInit(): Promise<void> {
    await migrate(this.db, {
      migrationsFolder: resolveDrizzleMigrationsFolder(),
    });
  }
}
