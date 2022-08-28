// src/pages/_app.tsx
import { withTRPC } from '@trpc/next'
import type { AppRouter } from '../server/router'
import superjson from 'superjson'
import { SessionProvider } from 'next-auth/react'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import '../styles/globals.scss'

import '../utils/extensions/array.ex'
import '../utils/extensions/date.ex'
import '../utils/extensions/number.ex'
import '../utils/extensions/string.ex'
import { NextPage } from 'next/types'
import { ReactElement, ReactNode } from 'react'
import { AppProps } from 'next/app'
import MainLayout from '../components/main.layout'

config.autoAddCss = true

library.add(fas, far, fab)

const App = ({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) => {
	const layout = Component.getLayout ?? ((page) => page)
	return <SessionProvider session={session}>{layout(<Component {...pageProps} />)}</SessionProvider>
}

export type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode
}
type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout
}
export function WithMainLayout(page: NextPage, title: string): NextPageWithLayout {
	;(page as NextPageWithLayout).getLayout = (page) => <MainLayout title={title}>{page}</MainLayout> //eslint-disable-line
	return page
}

const getBaseUrl = () => {
	if (typeof window !== 'undefined') {
		return ''
	}
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url

	return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export default withTRPC<AppRouter>({
	config({ ctx }) {
		/**
		 * If you want to use SSR, you need to use the server's full URL
		 * @link https://trpc.io/docs/ssr
		 */
		const url = `${getBaseUrl()}/api/trpc`

		return {
			url,
			transformer: superjson,
			/**
			 * @link https://react-query.tanstack.com/reference/QueryClient
			 */
			// queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
		}
	},
	/**
	 * @link https://trpc.io/docs/ssr
	 */
	ssr: false,
})(App)
