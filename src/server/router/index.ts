// src/server/router/index.ts
import { createRouter } from './context'
import superjson from 'superjson'
import { transaction_router } from './transactions'

export const appRouter = createRouter() //
	.transformer(superjson)
	.merge('transactions.', transaction_router)

// export type definition of API
export type AppRouter = typeof appRouter
