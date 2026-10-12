export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'packing', 'handed_to_taxi', 'delivered', 'cancelled']),
  note: z.string().max(500).optional(),
  taxi: z
    .object({
      driver: z.string().max(100).optional(),
      carNumber: z.string().max(20).optional(),
      service: z.string().max(100).optional(),
      note: z.string().max(500).optional(),
    })
    .optional(),
});