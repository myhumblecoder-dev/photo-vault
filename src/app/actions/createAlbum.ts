'use server'

import { z } from 'zod'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const nameSchema = z.string().trim().min(1)

export async function createAlbum(
  name: string,
): Promise<{ id: string; name: string }> {
  const parsedName = nameSchema.safeParse(name)
  if (!parsedName.success) {
    throw new Error('Invalid album name')
  }

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    const album = await prisma.album.create({
      data: { name: parsedName.data, userId: session.user.id },
    })
    return { id: album.id, name: album.name }
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      throw new Error('Album name already exists')
    }
    throw error
  }
}
