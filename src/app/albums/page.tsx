import { listAlbums } from '@/app/actions/listAlbums'
import { auth } from '@/auth'
import CreateAlbumForm from '@/components/CreateAlbumForm'
import AlbumCard from '@/components/AlbumCard'

// A DB-reading page must never be statically prerendered.
export const dynamic = 'force-dynamic'

export default async function AlbumsPage() {
  const session = await auth()

  if (!session?.user) {
    return <p data-testid="sign-in-prompt">Sign in to see your albums</p>
  }

  const albums = await listAlbums()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">My Albums</h1>
      <CreateAlbumForm />
      {albums.length === 0 ? (
        <p data-testid="empty-state">No albums yet</p>
      ) : (
        <div className="grid gap-4">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              name={album.name}
              createdAt={album.createdAt}
              href={`/albums/${album.id}`}
            />
          ))}
        </div>
      )}
    </main>
  )
}