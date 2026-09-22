import { z } from 'zod'
import { safeHttpUrl } from './utils'

const optionalHttpUrl = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .optional()
  .refine((v) => !v || safeHttpUrl(v) !== null, {
    message: 'Debe ser una URL http(s) válida',
  })
  .transform((v) => safeHttpUrl(v))

export const businessInputSchema = z.object({
  name: z.string().trim().min(2, 'Nombre muy corto').max(255),
  category: z.string().trim().min(1).max(255),
  district: z.string().trim().min(1).max(255),
  address: z.string().trim().min(3, 'Dirección muy corta').max(255),
  description: z.string().trim().max(2000).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  website: optionalHttpUrl,
  rating: z.number().min(1).max(5).nullable().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  imageUrl: optionalHttpUrl,
})

export type BusinessInput = z.infer<typeof businessInputSchema>
