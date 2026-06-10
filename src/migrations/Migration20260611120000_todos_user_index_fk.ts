import { Migration } from '@mikro-orm/migrations';

export class Migration20260611120000_todos_user_index_fk extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(
      `create table \`todos_user_fk\` (\`id\` text not null primary key, \`user_id\` text not null, \`title\` text not null, \`is_completed\` integer not null default false, \`created_at\` date not null, constraint \`todos_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete restrict);`,
    );
    this.addSql(
      `insert into \`todos_user_fk\` (\`id\`, \`user_id\`, \`title\`, \`is_completed\`, \`created_at\`) select \`id\`, \`user_id\`, \`title\`, \`is_completed\`, \`created_at\` from \`todos\`;`,
    );
    this.addSql(`drop table \`todos\`;`);
    this.addSql(`alter table \`todos_user_fk\` rename to \`todos\`;`);
    this.addSql(
      `create index \`todos_user_id_index\` on \`todos\` (\`user_id\`);`,
    );
    this.addSql(`pragma foreign_keys = on;`);
  }
}
