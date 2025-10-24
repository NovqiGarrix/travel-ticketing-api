import z from 'zod';

export const createPaymentSessionDto = z.object({
  ticketId: z.uuidv7({ message: 'Ticket ID is not valid' }),
});

export type CreatePaymentSessionDto = z.infer<typeof createPaymentSessionDto>;

// Read here: https://dashboard.xendit.co/settings/developers#webhooks
export const xenditPaymentSessionWebhook = z.object({
  event: z.enum(['payment_session.completed', 'payment_session.expired']),
  data: z.object({
    // payment_session_id
    id: z.string(),
    // this is the ticketId
    reference_id: z.string(),
  }),
});

export type XenditPaymentSessionWebhook = z.infer<
  typeof xenditPaymentSessionWebhook
>;
