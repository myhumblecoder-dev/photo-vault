import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

import { listAlbums } from './listAlbums'

vi.mock('@/lib/db', () => ({
  prisma: { album: { findMany: vi.fn() } },
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>)
const findMany = vi.mocked(prisma.album.findMany)

describe('listAlbums', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
  })

  it('unauthenticated session throws Unauthorized', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(listAlbums()).rejects.toThrow('Unauthorized')
    expect(findMany).not.toHaveBeenCalled()
  })

  it('authenticated call queries with correct userId filter and orderBy', async () => {
    findMany.mockResolvedValue([] as never)
    await listAlbums()
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true },
    })
  })

  it('empty result returns empty array', async () => {
    findMany.mockResolvedValue([] as never)
    await expect(listAlbums()).resolves.toEqual([])
  })
})
