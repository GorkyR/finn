// src/server/router/index.ts
import { createRouter } from './context'
import superjson from 'superjson'
import { transaction_router } from './transactions'
import { expenses_router } from './expenses'
import { income_router } from './income'

export const appRouter = createRouter() //
	.transformer(superjson)
	.merge('transactions.', transaction_router)
	.merge('expenses.', expenses_router)
	.merge('income.', income_router)

// export type definition of API
export type AppRouter = typeof appRouter
