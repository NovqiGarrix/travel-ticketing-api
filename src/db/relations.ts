import { relations } from 'drizzle-orm';
import {
  seat,
  schedule,
  departure,
  destination,
  ticket,
  payment,
} from './schema';

export const scheduleRelations = relations(schedule, ({ many, one }) => ({
  seats: many(seat),
  departure: one(departure, {
    fields: [schedule.departureId],
    references: [departure.id],
  }),
  destination: one(destination, {
    fields: [schedule.destinationId],
    references: [destination.id],
  }),
  tickets: many(ticket),
}));

export const seatRelations = relations(seat, ({ one }) => ({
  schedule: one(schedule, {
    fields: [seat.scheduleId],
    references: [schedule.id],
  }),
}));

export const departureRelations = relations(departure, ({ many }) => ({
  schedules: many(schedule),
}));

export const destinationRelations = relations(destination, ({ many }) => ({
  schedules: many(schedule),
}));

export const ticketRelations = relations(ticket, ({ one }) => ({
  schedule: one(schedule, {
    fields: [ticket.scheduleId],
    references: [schedule.id],
  }),
  payment: one(payment),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  ticket: one(ticket, {
    fields: [payment.ticketId],
    references: [ticket.id],
  }),
}));
