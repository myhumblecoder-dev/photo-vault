'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function listAlbums(): Promise<
  Array<{ id: string; name: string; createdAt: Date }>
> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  return prisma.album.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true },
  })
}
