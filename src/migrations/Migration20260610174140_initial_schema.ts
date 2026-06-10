import { Migration } from '@mikro-orm/migrations';

export class Migration20260610174140_initial_schema extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table \`todos\` (\`id\` text not null primary key, \`user_id\` text not null, \`title\` text not null, \`is_completed\` integer not null default false, \`created_at\` date not null);`,
    );

    this.addSql(
      `create table \`users\` (\`id\` text not null primary key, \`email\` text not null, \`password_hash\` text not null, \`created_at\` date not null);`,
    );
    this.addSql(
      `create unique index \`users_email_unique\` on \`users\` (\`email\`);`,
    );
  }
}
