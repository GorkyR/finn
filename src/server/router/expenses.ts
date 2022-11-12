import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { today } from '../../utils/date.utils'
import { createProtectedRouter } from './protected-router'

export const expenses_router = createProtectedRouter()
	.query('all', {
		async resolve({ ctx: { prisma, session } }) {
			const expenses = await prisma.expense.findMany({
				where: { user_id: session.user.id },
				orderBy: [{ repeats: 'asc' }, { lower_amount: 'desc' }],
			})
			return expenses.map((e) => ({
				...e,
				lower_amount: Number(e.lower_amount),
				upper_amount: Number(e.upper_amount),
				expired: e.date_end != null && e.date_end < today(),
			}))
		},
	})
	.query('active', {
		async resolve({ ctx: { prisma, session } }) {
			return await prisma.expense.findMany({
				where: {
					user_id: session.user.id,
					date_start: { lte: today() },
					OR: [{ date_end: null }, { date_end: { gte: today() } }],
				},
				orderBy: [{ repeats: 'asc' }, { lower_amount: 'desc' }],
			})
		},
	})
	.mutation('add', {
		input: z.object({
			name: z.string().trim().min(1),
			description: z.string().trim().nullish(),
			lower_amount: z.number().min(0),
			upper_amount: z.number().min(0),
			date_start: z.date(),
			date_end: z.date().nullish(),
			repeats: z.number().int().min(1),
		}),
		async resolve({ ctx: { session, prisma }, input }) {
			input.description ||= undefined
			const expense = await prisma.expense.create({ data: { user_id: session.user.id, ...input } })
			return expense.id
		},
	})
	.mutation('edit', {
		input: z.object({
			id: z.number().int().min(1),
			name: z.string().trim().min(1),
			description: z.string().trim().nullish(),
			lower_amount: z.number().min(0),
			upper_amount: z.number().min(0),
			date_start: z.date(),
			date_end: z.date().nullish(),
			repeats: z.number().int().min(1),
		}),
		async resolve({ ctx: { session, prisma }, input }) {
			const expense = await prisma.expense.findFirst({ where: { id: input.id, user_id: session.user.id } })
			if (!expense) throw new TRPCError({ code: 'NOT_FOUND', message: 'Gasto no encontrado.' })

			input.description ||= undefined
			await prisma.expense.update({
				where: { id: input.id },
				data: { ...input, id: undefined },
			})
		},
	})
	.mutation('remove', {
		input: z.number().int().min(1),
		async resolve({ ctx: { session, prisma }, input: id }) {
			const expense = await prisma.expense.findFirst({ where: { id, user_id: session.user.id } })
			if (!expense) throw new TRPCError({ code: 'NOT_FOUND', message: 'Gasto no encontrado.' })

			await prisma.expense.delete({ where: { id } })
		},
	})
