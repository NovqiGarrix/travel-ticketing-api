import z from 'zod';

export const getSchedulesParamsDto = z.object({
  departureId: z.uuidv7({ message: 'Departure ID is not valid' }),
  destinationId: z.uuidv7({ message: 'Destination ID is not valid' }),
  departureDate: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2} \d{1,2}:\d{1,2}:\d{1,2}$/, {
      message: `Departure date is not a valid 'YYYY-MM-DD HH:mm:ss' date`,
    }),
  totalPassenger: z.number().min(1).max(15).default(1),
});

export type GetSchedulesParamsDto = z.infer<typeof getSchedulesParamsDto>;
