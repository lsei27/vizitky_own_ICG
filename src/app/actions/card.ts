'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Card, Link, Social } from '@prisma/client'

type LinkInput = Pick<Link, 'title' | 'url'> &
  Partial<Pick<Link, 'id' | 'iconUrl' | 'cardId'>>

type SocialInput = Pick<Social, 'platform' | 'url'> &
  Partial<Pick<Social, 'id' | 'iconUrl' | 'cardId'>>

type SaveCardInput = Pick<Card, 'slug' | 'name'> &
  Partial<Omit<Card, 'slug' | 'name'>> & {
    links?: LinkInput[]
    socials?: SocialInput[]
  }

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

export async function saveCard(data: SaveCardInput) {
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
          data: links.map((link) => ({ ...link, cardId: id }))
        })
      }
    }

    if (socials) {
      await prisma.social.deleteMany({ where: { cardId: id } })
      if (socials.length > 0) {
        await prisma.social.createMany({
          data: socials.map((s) => ({ ...s, cardId: id }))
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

export async function duplicateCard(id: string) {
  const card = await prisma.card.findUnique({
    where: { id },
    include: { links: true, socials: true }
  })
  if (!card) throw new Error("Vizitka nenalezena")

  const { id: _, createdAt: __, updatedAt: ___, links, socials, ...cardData } = card;
  const newSlug = `${cardData.slug}-kopie-${Math.floor(Math.random() * 10000)}`

  const newCard = await prisma.card.create({
    data: {
      ...cardData,
      slug: newSlug,
      links: {
        create: links.map(link => {
          const { id: _linkId, cardId: _linkCardId, ...linkData } = link;
          return linkData;
        })
      },
      socials: {
        create: socials.map(social => {
          const { id: _socialId, cardId: _socialCardId, ...socialData } = social;
          return socialData;
        })
      }
    },
    include: { links: true, socials: true }
  })

  revalidatePath('/admin')
  return newCard
}
