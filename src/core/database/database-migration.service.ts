import { MikroORM } from '@mikro-orm/core';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isPostgresqlDatabaseUrl } from './utils/database-url.util';

/**
 * Applies pending MikroORM migrations on application startup.
 */
@Injectable()
export class DatabaseMigrationService implements OnModuleInit {
  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const databaseUrl = this.configService.get<string>('database.url', '');
    if (isPostgresqlDatabaseUrl(databaseUrl)) {
      return;
    }
    await this.orm.migrator.up();
  }
}
