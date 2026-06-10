import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseConfig } from '../config/database.config';
import { DrizzleDatabaseHealthAdapter } from './adapters/drizzle-database-health.adapter';
import {
  createDrizzleDb,
  createDrizzlePool,
  DRIZZLE_DB,
} from './drizzle.provider';
import type { DrizzleDb } from './drizzle.provider';
import { DrizzleMigrationService } from './drizzle-migration.service';
import { PG_POOL } from './pg-pool.token';
import { DATABASE_HEALTH } from './ports/database-health.port';

/**
 * Database module that configures the Drizzle PostgreSQL connection.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool => {
        const databaseUrl = configService.get<DatabaseConfig['url']>(
          'database.url',
          'postgresql://postgres:postgres@localhost:5432/app',
        );
        return createDrizzlePool(databaseUrl);
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [PG_POOL],
      useFactory: (pool: Pool): DrizzleDb => createDrizzleDb(pool),
    },
    DrizzleMigrationService,
    DrizzleDatabaseHealthAdapter,
    {
      provide: DATABASE_HEALTH,
      useExisting: DrizzleDatabaseHealthAdapter,
    },
  ],
  exports: [DATABASE_HEALTH, DRIZZLE_DB],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
