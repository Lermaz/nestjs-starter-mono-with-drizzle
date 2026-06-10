import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';
import { MikroDatabaseHealthAdapter } from './adapters/mikro-database-health.adapter';
import { DatabaseMigrationService } from './database-migration.service';
import { buildMikroOrmOptions } from './mikro-orm.config';
import { DATABASE_HEALTH } from './ports/database-health.port';

/**
 * Database module that configures the MikroORM connection.
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
    DatabaseMigrationService,
    MikroDatabaseHealthAdapter,
    {
      provide: DATABASE_HEALTH,
      useExisting: MikroDatabaseHealthAdapter,
    },
  ],
  exports: [DATABASE_HEALTH],
})
export class DatabaseModule {}
