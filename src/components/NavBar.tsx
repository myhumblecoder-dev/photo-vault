import Link from 'next/link'

import { auth, signIn, signOut } from '@/auth'
import { Button } from '@/components/ui/button'

export default async function NavBar() {
  const session = await auth()

  return (
    <nav className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold">
          Photo Vault
        </Link>
        <Link href="/albums">My Albums</Link>
      </div>

      {session?.user ? (
        <div className="flex items-center gap-3">
          <span data-testid="user-name">{session.user.name}</span>
          <form
            action={async () => {
              'use server'
              await signOut()
            }}
          >
            <Button type="submit">Sign out</Button>
          </form>
        </div>
      ) : (
        <form
          action={async () => {
            'use server'
            await signIn('github')
          }}
        >
          <Button type="submit">Sign in</Button>
        </form>
      )}
    </nav>
  )
}
