import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

import { createAlbum } from './createAlbum'

vi.mock('@/lib/db', () => ({
  prisma: { album: { create: vi.fn() } },
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

// `auth` is overloaded in Auth.js, so vi.mocked(auth) resolves the middleware
// overload and rejects a session. Drive it through this handle instead.
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>)
const create = vi.mocked(prisma.album.create)

describe('createAlbum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
  })

  it('whitespace-only name is rejected before db call', async () => {
    await expect(createAlbum('   ')).rejects.toThrow(/^Invalid album name/)
    expect(create).not.toHaveBeenCalled()
  })

  it('unauthenticated session throws Unauthorized', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(createAlbum('Holiday')).rejects.toThrow('Unauthorized')
    expect(create).not.toHaveBeenCalled()
  })

  it('valid name calls prisma.album.create with correct data and returns id and name', async () => {
    create.mockResolvedValue({ id: 'album-1', name: 'Holiday' } as never)

    await expect(createAlbum('  Holiday  ')).resolves.toEqual({
      id: 'album-1',
      name: 'Holiday',
    })
    expect(create).toHaveBeenCalledWith({
      data: { name: 'Holiday', userId: 'user-1' },
    })
  })

  it('surfaces a unique-constraint violation as a friendly message', async () => {
    create.mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }))
    await expect(createAlbum('Holiday')).rejects.toThrow('Album name already exists')
  })
})
