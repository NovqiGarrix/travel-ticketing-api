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
  seatIdentifier: z.string().regex(/A([1-9]|1[0-5])/, {
    error: 'Seat Identifier is not valid. Valid value: A2, A3, C2, etc...',
  }),
});

export type CreateTicketDto = z.infer<typeof createTicketDto>;

export const updateTicketDto = z.object({
  scheduleId: z.uuidv7({ error: 'Schedule ID is not valid' }).optional(),
  totalPassenger: z.number().min(1).max(15).optional(),
  orderer: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      noWa: z
        .string()
        .regex(/\+?([ -]?\d+)+|\(\d+\)([ -]\d+)/, {
          error: 'No.WhatsApp is not valid',
        })
        .optional(),
    })
    .optional(),
  seatIdentifier: z
    .string()
    .regex(/A([1-9]|1[0-5])/, {
      error: 'Seat Identifier is not valid. Valid value: A2, A3, C2, etc...',
    })
    .optional(),
});

export type UpdateTicketDto = z.Infer<typeof updateTicketDto>;
