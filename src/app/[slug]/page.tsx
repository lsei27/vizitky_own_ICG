import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import styles from './card.module.css'

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await prisma.card.findUnique({
    where: { slug: slug },
    include: { links: true, socials: true }
  })

  if (!card) return notFound()

  return (
    <div className={styles.wrapper} style={{ '--theme-color': card.themeColor } as React.CSSProperties}>
      <div className={styles.cover} style={{ backgroundImage: `url(${card.coverImage || ''})` }}></div>
      <div className={styles.inner}>
        <div className={styles.profilePic} style={{ backgroundImage: `url(${card.profileImage || ''})` }}></div>
        <h2 className={styles.name}>{card.name}</h2>
        {card.jobTitle && <p className={styles.jobTitle}>{card.jobTitle}</p>}
        {card.company && <p className={styles.company}>{card.company}</p>}

        <div className={styles.shortcuts}>
          {card.mobile && (
            <a href={`tel:${card.mobile}`} className={styles.shortcutIcon} title="Zavolat">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className={styles.shortcutIcon} title="E-mail">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </a>
          )}
          {card.sms && (
            <a href={`sms:${card.sms}`} className={styles.shortcutIcon} title="Napsat SMS">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/></svg>
            </a>
          )}
          {card.whatsapp && (
            <a href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`} className={styles.shortcutIcon} title="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.4l-.1-.1A11.8 11.8 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.6c1.8 1 3.8 1.5 5.8 1.5h.1c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5zM12 21.8h-.1c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 .9-3.6-.3-.4A9.8 9.8 0 0 1 2 12c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10z"/><path d="M17.5 14.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-1-1-1.3-1.5-1.5-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.4-.5.1-.2.1-.3.2-.5.1-.2.1-.4 0-.5-.1-.2-.9-2.2-1.2-3-.3-.8-.7-.7-1-.7h-.8c-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 3.8 0 2.2 1.6 4.3 1.8 4.6.3.3 3.1 4.8 7.5 6.7.8.3 1.5.5 2 .7.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.5.2-.8.2-1.5.1-1.6-.2-.1-.5-.2-.8-.4z"/></svg>
            </a>
          )}
        </div>

        {/* Contact info section */}
        {(card.mobile || card.email || card.street) && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              {card.companyLogo && <div className={styles.sectionHeaderImg} style={{backgroundImage: `url(${card.companyLogo})`}}></div>}
              <h3 className={styles.sectionTitle}>{card.company || 'Kontakt'}</h3>
            </div>
            {card.mobile && (
              <div className={styles.infoRow}>
                <div className={styles.infoTitle}>Telefon</div>
                <div className={styles.infoValue}><a href={`tel:${card.mobile}`}>{card.mobile}</a></div>
              </div>
            )}
            {card.email && (
              <div className={styles.infoRow}>
                <div className={styles.infoTitle}>E-mail</div>
                <div className={styles.infoValue}><a href={`mailto:${card.email}`}>{card.email}</a></div>
              </div>
            )}
            {card.street && (
              <div className={styles.infoRow}>
                <div className={styles.infoTitle}>Adresa</div>
                <div className={styles.infoValue}>
                  {card.addressUrl ? (
                    <a href={card.addressUrl} target="_blank" rel="noopener noreferrer">
                      {card.addressTitle && <>{card.addressTitle}<br/></>}
                      {card.street}<br/>
                      {card.city}, {card.zip}
                    </a>
                  ) : (
                    <>
                      {card.addressTitle && <>{card.addressTitle}<br/></>}
                      {card.street}<br/>
                      {card.city}, {card.zip}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Web Links section */}
        {card.links.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle} style={{marginBottom: '1rem'}}>Odkazy</h3>
            {card.links.map(link => (
              <a key={link.id} href={link.url} className={styles.linkItem} target="_blank" rel="noopener noreferrer">
                {link.iconUrl && <div className={styles.linkItemIcon} style={{backgroundImage: `url(${link.iconUrl})`}}></div>}
                <div className={styles.linkItemTitle}>{link.title}</div>
              </a>
            ))}
          </div>
        )}

        {/* Social Links section */}
        {card.socials.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle} style={{marginBottom: '1rem'}}>Sledujte nás</h3>
            {card.socials.map(social => (
              <a key={social.id} href={social.url} className={styles.linkItem} target="_blank" rel="noopener noreferrer">
                {social.iconUrl ? (
                  <div className={styles.linkItemIcon} style={{backgroundImage: `url(${social.iconUrl})`}}></div>
                ) : (
                  <div className={styles.linkItemIcon} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#333'}}>
                    {social.platform.substring(0,2).toUpperCase()}
                  </div>
                )}
                <div className={styles.linkItemTitle} style={{textTransform: 'capitalize'}}>{social.platform}</div>
              </a>
            ))}
          </div>
        )}
      </div>

      <a href={`/api/vcard/${card.id}`} className={styles.floatingBtn}>
        <span>Přidat kontakt</span>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </a>
    </div>
  )
}
