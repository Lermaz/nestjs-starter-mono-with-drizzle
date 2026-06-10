import { MikroORM } from '@mikro-orm/core';
import { Injectable, OnModuleInit } from '@nestjs/common';

/**
 * Applies pending database migrations on application startup.
 */
@Injectable()
export class DatabaseMigrationService implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    await this.orm.migrator.up();
  }
}
