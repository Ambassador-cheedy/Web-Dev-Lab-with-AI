import { z } from 'zod';

export const OCCASIONS = ['Wedding', 'Traditional ceremony', 'Evening event', 'Work', 'Everyday', 'Other'] as const;
export const TIME_SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Shared by the client form and the API route. */
export const madeToMeasureSchema = z
  .object({
    name: z.string().trim().min(2, 'Please tell us your name'),
    email: z.email('Please enter a valid email address'),
    productSlug: z.string().optional(),
    profileId: z.string().optional(),
    profileJson: z.string().optional(),
    occasion: z.enum(OCCASIONS, { error: 'Please choose an occasion' }),
    deadline: z.string().optional(),
    fabricNotes: z.string().max(1000).optional(),
    consultation: z.enum(['none', 'virtual', 'in-person']),
    consultDate: z.string().optional(),
    consultTime: z.string().optional(),
  })
  .refine((v) => v.consultation === 'none' || (!!v.consultDate && !!v.consultTime), {
    message: 'Please choose a date and time for your consultation',
    path: ['consultDate'],
  })
  .refine((v) => !v.deadline || new Date(v.deadline) > new Date(), {
    message: 'Please choose a date in the future',
    path: ['deadline'],
  });

export type MadeToMeasureValues = z.infer<typeof madeToMeasureSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name'),
  email: z.email('Please enter a valid email address'),
  topic: z.enum(['Order', 'Fit & sizing', 'Made to measure', 'Press', 'Other']),
  message: z.string().trim().min(10, 'A few more words, please').max(2000),
});
export type ContactValues = z.infer<typeof contactSchema>;
