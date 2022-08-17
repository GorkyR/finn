import type { NextPage } from 'next'
import { useSession, signIn, signOut } from 'next-auth/react'
import Head from 'next/head'
import Icon from '../components/icon'

const Home: NextPage = () => {
	const { data: session, status } = useSession()
	console.debug('session:', session)

	if (status === 'loading') return <Icon icon='spinner' size='3x' pulse />

	return (
		<>
			<Head>
				<title>{session ? `${session.user?.name} | ` : ''}Finn</title>
				<meta name='description' content='Finance tracker' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main
				className={[
					'container min-h-screen mx-auto',
					!session && 'flex flex-col items-center justify-center p-4',
					session && 'flex items-stretch',
				]
					.filter((_) => _)
					.join(' ')}>
				{session ? (
					<>
						<div className='sidebar'></div>
						<div className='main'>
							<h1 className='font-semibold text-xl'>{session.user?.name}</h1>
						</div>
					</>
				) : (
					// Not logged in
					<button
						className='border rounded-md p-2 border-neutral-300 shadow-lg'
						onClick={() => signIn('google')}>
						Sign in with <Icon icon={['fab', 'google']} title='Google' className='text-red-500' />
					</button>
				)}
			</main>
		</>
	)
}

export default Home
