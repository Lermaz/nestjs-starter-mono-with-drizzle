import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseConfig } from '../config/database.config';
import { DrizzleDatabaseHealthAdapter } from './adapters/drizzle-database-health.adapter';
import { MikroDatabaseHealthAdapter } from './adapters/mikro-database-health.adapter';
import { DatabaseMigrationService } from './database-migration.service';
import {
  createDrizzleDb,
  createDrizzlePool,
  DRIZZLE_DB,
  DrizzleDb,
} from './drizzle.provider';
import { DrizzleMigrationService } from './drizzle-migration.service';
import { PG_POOL } from './pg-pool.token';
import {
  DATABASE_HEALTH,
  DatabaseHealthPort,
} from './ports/database-health.port';
import { isPostgresqlDatabaseUrl } from './utils/database-url.util';
import { buildMikroOrmOptions } from './mikro-orm.config';

/**
 * Database module that configures MikroORM (transition) and Drizzle connections.
 */
@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<DatabaseConfig['url']>(
          'database.url',
          'sqlite://./data/app.db',
        );
        return {
          ...buildMikroOrmOptions(databaseUrl),
          driver: SqliteDriver,
        };
      },
    }),
  ],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool | null => {
        const databaseUrl = configService.get<string>('database.url', '');
        if (!isPostgresqlDatabaseUrl(databaseUrl)) {
          return null;
        }
        return createDrizzlePool(databaseUrl);
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [PG_POOL],
      useFactory: (pool: Pool | null): DrizzleDb | null => {
        if (!pool) {
          return null;
        }
        return createDrizzleDb(pool);
      },
    },
    DatabaseMigrationService,
    DrizzleMigrationService,
    MikroDatabaseHealthAdapter,
    DrizzleDatabaseHealthAdapter,
    {
      provide: DATABASE_HEALTH,
      inject: [
        ConfigService,
        DrizzleDatabaseHealthAdapter,
        MikroDatabaseHealthAdapter,
      ],
      useFactory: (
        configService: ConfigService,
        drizzleHealth: DrizzleDatabaseHealthAdapter,
        mikroHealth: MikroDatabaseHealthAdapter,
      ): DatabaseHealthPort => {
        const databaseUrl = configService.get<string>('database.url', '');
        return isPostgresqlDatabaseUrl(databaseUrl)
          ? drizzleHealth
          : mikroHealth;
      },
    },
  ],
  exports: [DATABASE_HEALTH, DRIZZLE_DB],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool | null) {}

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
