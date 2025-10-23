import { create } from 'node:domain';
import z from 'zod';

export const createTicketDto = z.object({
  scheduleId: z.uuidv7({ error: 'Schedule ID is not valid' }),
  totalPassenger: z.number().min(1).max(15).default(1),
  orderer: z.object({
    name: z.string().min(1, { error: 'Name is required' }),
    email: z.string().min(1, { error: 'Email is required' }),
    noWa: z.string().regex(/\+?([ -]?\d+)+|\(\d+\)([ -]\d+)/, {
      error: 'No.WhatsApp is not valid',
    }),
  }),
  seatIdentifier: z.string().min(2, {
    error: 'Seat Identifier is not valid. Valid value: A2, A3, C2, etc...',
  }),
});

export type CreateTicketDto = z.infer<typeof createTicketDto>;
