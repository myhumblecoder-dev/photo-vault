'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function deleteAlbum(albumId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.album.delete({
      where: { id: albumId, userId: session.user.id },
    })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2025') {
      throw new Error('Album not found')
    }
    throw error
  }
}
