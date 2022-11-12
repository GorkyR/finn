import { PrismaClientRustPanicError } from '@prisma/client/runtime'
import { resolve } from 'path'
import { z } from 'zod'
import { today } from '../../utils/date.utils'
import { createProtectedRouter } from './protected-router'

export const income_router = createProtectedRouter() //
	.query('all', {
		async resolve({ ctx: { session, prisma } }) {
			const income = await prisma.income.findMany({
				where: { user_id: session.user.id },
				orderBy: [{ repeats: 'asc' }, { amount: 'desc' }],
			})
			return income.map((i) => ({
				...i,
				amount: Number(i.amount),
				expired: i.date_end != null && i.date_end < today(),
			}))
		},
	})
	.query('hours-per-year', {
		async resolve({ ctx: { session, prisma } }) {
			const data = await prisma.userData.findUnique({ where: { user_id: session.user.id } })
			return data?.hours_per_year ?? 0
		},
	})
	.query('hours-per-day', {
		async resolve({ ctx: { session, prisma } }) {
			const data = await prisma.userData.findUnique({ where: { user_id: session.user.id } })
			return data?.hours_per_day ?? 0
		},
	})
	.mutation('add', {
		input: z.object({
			description: z.string().trim().min(1),
			amount: z.number().gt(0),
			date_start: z.date(),
			date_end: z.date().nullish(),
			repeats: z.number().int().min(1),
		}),
		async resolve({ ctx: { session, prisma }, input }) {
			const income = await prisma.income.create({ data: { ...input, user_id: session.user.id } })
			return income.id
		},
	})
	.mutation('edit-hours-per-year', {
		input: z.number().int().min(0),
		async resolve({ ctx: { session, prisma }, input: hours }) {
			await prisma.userData.upsert({
				where: { user_id: session.user.id },
				create: {
					user_id: session.user.id,
					hours_per_year: hours,
					hours_per_day: 8,
				},
				update: { hours_per_year: hours },
			})
		},
	})
	.mutation('edit-hours-per-day', {
		input: z.number().int().min(0),
		async resolve({ ctx: { session, prisma }, input: hours }) {
			await prisma.userData.upsert({
				where: { user_id: session.user.id },
				create: {
					user_id: session.user.id,
					hours_per_day: hours,
					hours_per_year: 0,
				},
				update: { hours_per_day: hours },
			})
		},
	})
