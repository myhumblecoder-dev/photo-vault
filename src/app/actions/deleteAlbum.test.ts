import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

import { deleteAlbum } from './deleteAlbum'

vi.mock('@/lib/db', () => ({
  prisma: { album: { delete: vi.fn() } },
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>)
const del = vi.mocked(prisma.album.delete)

describe('deleteAlbum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
  })

  it('unauthenticated session throws Unauthorized', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(deleteAlbum('album-1')).rejects.toThrow('Unauthorized')
    expect(del).not.toHaveBeenCalled()
  })

  it('authenticated call deletes with correct id and userId', async () => {
    del.mockResolvedValue({} as never)
    await deleteAlbum('album-1')
    expect(del).toHaveBeenCalledWith({
      where: { id: 'album-1', userId: 'user-1' },
    })
  })

  it('P2025 error is re-thrown as Album not found', async () => {
    del.mockRejectedValue(Object.assign(new Error('missing'), { code: 'P2025' }))
    await expect(deleteAlbum('nope')).rejects.toThrow('Album not found')
  })
})
