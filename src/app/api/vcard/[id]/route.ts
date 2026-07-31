import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

const PHOTO_SIZE = 400
const PHOTO_FETCH_TIMEOUT_MS = 5000
const PHOTO_CACHE_SECONDS = 86400
const PHOTO_MAX_BYTES = 10 * 1024 * 1024

// The image URL comes from the admin panel, so this is not attacker-reachable without a
// login, but the fetch still runs server-side and must not be usable to reach private
// infrastructure. Literal loopback/private/link-local hosts are rejected outright.
const isPrivateHost = (hostname: string) => {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) return true
  if (host === '::1' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) return true

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ipv4) return false
  const [a, b] = [Number(ipv4[1]), Number(ipv4[2])]
  return (
    a === 0 || a === 127 || a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  )
}

const isFetchableImageUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && !isPrivateHost(parsed.hostname)
  } catch {
    return false
  }
}

// RFC 2426: a content line is folded at 75 octets, continuation lines start with a space.
// Without this the long base64 photo line is rejected by some Android contact importers.
const foldLine = (line: string) => {
  if (line.length <= 75) return line
  const folded = [line.slice(0, 75)]
  for (let i = 75; i < line.length; i += 74) {
    folded.push(` ${line.slice(i, i + 74)}`)
  }
  return folded.join('\r\n')
}

// Profile images are external URLs in mixed formats (jpeg/png/webp) and up to ~670 KB.
// iOS and Android only reliably import an embedded photo, and neither reads webp, so the
// image is normalised to a small square JPEG. Returns null on any failure, which keeps the
// download working without a photo rather than failing the whole vCard.
const buildPhotoLine = async (url: string) => {
  if (!isFetchableImageUrl(url)) return null

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(PHOTO_FETCH_TIMEOUT_MS),
      next: { revalidate: PHOTO_CACHE_SECONDS },
      // Do not follow redirects: a redirect target would otherwise bypass the URL check above.
      redirect: 'manual',
    })
    if (!response.ok) return null
    if (!response.headers.get('content-type')?.startsWith('image/')) return null
    if (Number(response.headers.get('content-length')) > PHOTO_MAX_BYTES) return null

    const body = Buffer.from(await response.arrayBuffer())
    if (body.byteLength > PHOTO_MAX_BYTES) return null

    const jpeg = await sharp(body)
      .rotate() // honour EXIF orientation, otherwise phone photos import sideways
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()

    return foldLine(`PHOTO;ENCODING=b;TYPE=JPEG:${jpeg.toString('base64')}`)
  } catch {
    return null
  }
}

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

  if (card.profileImage) {
    const photoLine = await buildPhotoLine(card.profileImage)
    if (photoLine) vcardLines.push(photoLine)
  }

  vcardLines.push('END:VCARD')

  // CRLF is required by RFC 2426 and is what makes the folded PHOTO line unfold correctly.
  const vcardData = vcardLines.join('\r\n')

  return new Response(vcardData, {
    headers: {
      'Content-Type': 'text/vcard',
      'Content-Disposition': `attachment; filename="${card.slug}.vcf"`,
    },
  })
}
