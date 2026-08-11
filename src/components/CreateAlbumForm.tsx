'use client'

import { useState } from 'react'

import { createAlbum } from '@/app/actions/createAlbum'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CreateAlbumForm({
  onCreated,
}: {
  onCreated?: (album: { id: string; name: string }) => void
}) {
  // Initialised directly — never synced from props via useEffect, which
  // triggers React's "setState synchronously within an effect" lint error.
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const album = await createAlbum(name)
      setName('')
      onCreated?.(album)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <Input
        name="albumName"
        placeholder="Album name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Button type="submit" disabled={pending}>
        {pending ? 'Creating…' : 'Create'}
      </Button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  )
}
