import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from '../../../auth/infrastructure/schema/users.schema';

/**
 * Drizzle schema for the todos table (owned by TodosModule).
 */
export const todosTable = pgTable(
  'todos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'restrict' }),
    title: varchar('title', { length: 255 }).notNull(),
    isCompleted: boolean('is_completed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('todos_user_id_index').on(table.userId)],
);

export type TodoRow = typeof todosTable.$inferSelect;
export type NewTodoRow = typeof todosTable.$inferInsert;
