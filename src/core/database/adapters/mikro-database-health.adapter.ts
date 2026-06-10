import { MikroORM } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { DatabaseHealthPort } from '../ports/database-health.port';

/**
 * MikroORM implementation of database connectivity checks.
 */
@Injectable()
export class MikroDatabaseHealthAdapter implements DatabaseHealthPort {
  constructor(private readonly orm: MikroORM) {}

  async checkConnectivity(): Promise<boolean> {
    try {
      await this.orm.em.getConnection().execute('select 1');
      return true;
    } catch {
      return false;
    }
  }
}
