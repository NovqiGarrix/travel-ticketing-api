import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { v7 as v7uuid } from 'uuid';

// Store all occupied seats
// means, seats that are paid
export const seat = pgTable('seats', {
  id: serial().primaryKey(),
  seatIdentifier: varchar('seat_identifier', { length: 2 }).notNull(),
  scheduleId: uuid('schedule_id')
    .references(() => schedule.id, { onDelete: 'cascade' })
    .notNull(),
});

export type Seat = typeof seat.$inferSelect;

export const departure = pgTable('departures', {
  id: uuid()
    .$default(() => v7uuid())
    .primaryKey(),
  label: varchar({ length: 256 }).notNull(),
  tag: varchar({ length: 128 }).notNull(),
});

export const destination = pgTable('destinations', {
  id: uuid()
    .$default(() => v7uuid())
    .primaryKey(),
  label: varchar({ length: 256 }).notNull(),
  tag: varchar({ length: 128 }).notNull(),
});

export const schedule = pgTable('schedules', {
  id: uuid()
    .$default(() => v7uuid())
    .primaryKey(),
  isAvailable: boolean('is_available').default(true),
  price: integer().notNull(),
  time: timestamp({ mode: 'string', withTimezone: true }).notNull(),
  departureId: uuid('departure_id')
    .references(() => departure.id, { onDelete: 'cascade' })
    .notNull(),
  destinationId: uuid('destination_id')
    .references(() => destination.id, { onDelete: 'cascade' })
    .notNull(),
  // In seconds
  estimationTime: integer('estimation_time').notNull(),
});

export type Schedule = typeof schedule.$inferSelect;
export type NewSchedule = typeof schedule.$inferInsert;

export const ticket = pgTable('tickets', {
  id: uuid()
    .$default(() => v7uuid())
    .primaryKey(),
  scheduleId: uuid('schedule_id')
    .notNull()
    .references(() => schedule.id, { onDelete: 'cascade' }),
  totalPassenger: integer('total_passenger').notNull(),
  orderer: json('orderer').notNull(),
  seatIdentifier: varchar('seat_identifier', { length: 2 }).notNull(),
});

export type Ticket = typeof ticket.$inferSelect;

export const payment = pgTable(
  'payments',
  {
    id: uuid()
      .$default(() => v7uuid())
      .primaryKey(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => ticket.id, { onDelete: 'cascade' }),
    paymentSessionId: varchar('payment_session_id', { length: 256 }).notNull(), // Xendit payment session ID,
    paymentStatus: varchar('payment_status', {
      length: 12,
      enum: ['PENDING', 'PAID', 'EXPIRED', 'ERROR'],
    })
      .notNull()
      .default('PENDING'),
    amount: integer().notNull(),
    error: text(),
  },
  (table) => [index('payment_session_id_index').on(table.paymentSessionId)],
);
