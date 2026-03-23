'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCards() {
  return await prisma.card.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getCard(slug: string) {
  return await prisma.card.findUnique({
    where: { slug },
    include: {
      links: true,
      socials: true
    }
  })
}

export async function getCardById(id: string) {
  return await prisma.card.findUnique({
    where: { id },
    include: {
      links: true,
      socials: true
    }
  })
}

export async function saveCard(data: any) {
  const { id, links, socials, ...cardData } = data

  let savedCard
  if (id) {
    savedCard = await prisma.card.update({
      where: { id },
      data: cardData
    })

    if (links) {
      await prisma.link.deleteMany({ where: { cardId: id } })
      if (links.length > 0) {
        await prisma.link.createMany({
          data: links.map((link: any) => ({ ...link, cardId: id }))
        })
      }
    }

    if (socials) {
      await prisma.social.deleteMany({ where: { cardId: id } })
      if (socials.length > 0) {
        await prisma.social.createMany({
          data: socials.map((s: any) => ({ ...s, cardId: id }))
        })
      }
    }
  } else {
    savedCard = await prisma.card.create({
      data: {
        ...cardData,
        links: {
          create: links || []
        },
        socials: {
          create: socials || []
        }
      }
    })
  }

  revalidatePath('/admin')
  revalidatePath(`/${savedCard.slug}`)
  revalidatePath(`/page/${savedCard.slug}`)
  
  return savedCard
}

export async function deleteCard(id: string) {
  await prisma.card.delete({ where: { id } })
  revalidatePath('/admin')
}
