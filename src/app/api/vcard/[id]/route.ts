import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id: id },
  })

  if (!card) {
    return new Response('Not found', { status: 404 })
  }

  // Construct vCard string
  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${card.name.split(' ').reverse().join(';')};;;`,
    `FN:${card.name}`,
  ]

  if (card.company) vcardLines.push(`ORG:${card.company}`)
  if (card.jobTitle) vcardLines.push(`TITLE:${card.jobTitle}`)
  
  const addedPhones = new Set<string>()

  const addPhone = (number: string | null) => {
    if (!number) return
    const normalized = number.replace(/\s+/g, '')
    if (!addedPhones.has(normalized)) {
      vcardLines.push(`TEL;TYPE=cell,voice:${number}`)
      addedPhones.add(normalized)
    }
  }

  addPhone(card.mobile)
  addPhone(card.whatsapp)
  addPhone(card.sms)
  
  if (card.email) vcardLines.push(`EMAIL;TYPE=work,internet:${card.email}`)
  if (card.addressUrl) vcardLines.push(`URL:${card.addressUrl}`)

  // Addresses in vCard format: post office box; extended address; street address; locality; region; postal code; country name
  if (card.street || card.city || card.zip) {
    vcardLines.push(`ADR;TYPE=work:;;${card.street || ''};${card.city || ''};;${card.zip || ''};`)
  }

  vcardLines.push('END:VCARD')

  const vcardData = vcardLines.join('\n')

  return new Response(vcardData, {
    headers: {
      'Content-Type': 'text/vcard',
      'Content-Disposition': `attachment; filename="${card.slug}.vcf"`,
    },
  })
}
