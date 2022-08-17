import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createProtectedRouter } from './protected-router'

export const transaction_router = createProtectedRouter()
	.query('months', {
		async resolve({ ctx: { session, prisma } }) {
			const months = await prisma.transaction.groupBy({
				where: { user_id: session.user.id },
				by: ['year', 'month'],
				_count: true,
			})
			return months
		},
	})
	.query('by-month', {
		input: z.object({
			year: z.number().int(),
			month: z.number().int(),
		}),
		async resolve({
			ctx: {
				session: {
					user: { id: user_id },
				},
				prisma,
			},
			input: { year, month },
		}) {
			return await prisma.transaction.findMany({
				where: { user_id, year, month },
				include: { tags: true },
			})
		},
	})
	.mutation('new', {
		input: z.object({
			date: z.date().max(new Date(), 'No puedes registrar una transacción en el futuro.'),
			destination: z.string().trim().min(1, 'Destino requerido.'),
			description: z.string().trim().nullish(),
			amount: z.number(),
			tags: z.string().trim().min(1).array().nullish(),
		}),
		async resolve({
			ctx: {
				session: {
					user: { id: user_id },
				},
				prisma,
			},
			input,
		}) {
			if (input.amount === 0)
				throw new TRPCError({ code: 'BAD_REQUEST', message: 'El monto es requerido.' })
			const { id } = await prisma.transaction.create({
				data: {
					user_id,
					date: input.date,
					year: input.date.getFullYear(),
					month: input.date.getMonth(),
					destination: input.destination,
					description: input.description || undefined,
					amount: input.amount,
					tags: {
						connectOrCreate: input.tags?.map((tag) => ({
							create: { name: tag.toLowerCase(), user_id },
							where: {
								name_user_id: { name: tag.toLowerCase(), user_id },
							},
						})),
					},
				},
			})
			return id
		},
	})
