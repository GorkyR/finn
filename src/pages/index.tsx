import type { NextPage } from 'next'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Icon from '../components/icon'
import { WithMainLayout } from './_app'

const HomePage: NextPage = () => {
	const { data: session, status } = useSession()
	const navigate = useRouter().push

	if (status === 'loading') return <Icon icon='spinner' size='3x' pulse />

	if (status === 'authenticated') {
		navigate('/transactions')
		return <></>
	}

	return (
		<>
			<main
				className={[
					'container min-h-screen mx-auto',
					!session && 'flex flex-col items-center justify-center p-4',
					session && 'flex items-stretch',
				]
					.filter((_) => _)
					.join(' ')}>
				<div className='flex flex-col gap-3'>
					<button
						className='border rounded-md p-2 border-neutral-300 shadow-lg'
						onClick={() => signIn('google')}>
						Sign in with <Icon icon={['fab', 'google']} title='Google' className='text-red-500' />
					</button>

					<button
						className='border rounded-md p-2 border-neutral-300 shadow-lg'
						onClick={() => signIn('github')}>
						Sign in with <Icon icon={['fab', 'github']} title='GitHub' />
					</button>
				</div>
			</main>
		</>
	)
}

export default WithMainLayout(HomePage, '')
