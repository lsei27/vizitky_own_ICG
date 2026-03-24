'use client'

import { useState } from 'react'
import { saveCard, deleteCard, duplicateCard } from '@/app/actions/card'
import styles from './admin.module.css'
import QRCodeGenerator from './QRCodeGenerator'

export default function CardForm({ initialCards }: { initialCards: any[] }) {
  const [cards, setCards] = useState(initialCards)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<any>({
    slug: '', name: '', jobTitle: '', company: '', 
    themeColor: '#1A171B', mobile: '', email: '', sms: '', whatsapp: '',
    addressTitle: '', street: '', city: '', zip: '', addressUrl: '',
    profileImage: '', coverImage: '', companyLogo: '', qrCodeLogo: '',
    links: [], socials: []
  })

  const [loading, setLoading] = useState(false)

  const handleSelectCard = async (card: any) => {
    setActiveCardId(card.id)
    // In a real app we might fetch the full card if we didn't send all relations, but initialCards can be partial.
    // Let's just use what we have, or assume we loaded full for simplicity.
    // Fetch full card via API action
    const { getCardById } = await import('@/app/actions/card')
    const full = await getCardById(card.id)
    if (full) {
      setFormData(full)
    }
  }

  const handleNewCard = () => {
    setActiveCardId(null)
    setFormData({
      slug: '', name: '', jobTitle: '', company: '', 
      themeColor: '#1A171B', mobile: '', email: '', sms: '', whatsapp: '',
      addressTitle: '', street: '', city: '', zip: '', addressUrl: '',
      profileImage: '', coverImage: '', companyLogo: '', qrCodeLogo: '',
      links: [], socials: []
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const saved = await saveCard(formData)
      if (activeCardId) {
        setCards(cards.map(c => c.id === saved.id ? saved : c))
      } else {
        setCards([saved, ...cards])
      }
      setActiveCardId(saved.id)
      setFormData({ ...saved, links: (saved as any).links || formData.links || [], socials: (saved as any).socials || formData.socials || [] })
      alert("Uloženo úspěšně!")
    } catch (err: any) {
      alert("Chyba při ukládání: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async () => {
    if (!activeCardId) return
    if (!confirm('Opravdu chcete duplikovat tuto vizitku? Vytvoří se kopie s unikátní URL adresou.')) return

    setLoading(true)
    try {
      const newCard = await duplicateCard(activeCardId)
      setCards([newCard, ...cards])
      setActiveCardId(newCard.id)
      setFormData({ ...newCard, links: newCard.links, socials: newCard.socials })
      alert("Vizitka zkopírována s novou unikátní URL!")
    } catch (err: any) {
      alert("Chyba při duplikování: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!activeCardId) return
    if (!confirm("Opravdu smazat?")) return
    setLoading(true)
    try {
      await deleteCard(activeCardId)
      setCards(cards.filter(c => c.id !== activeCardId))
      handleNewCard()
    } catch (err: any) {
      alert("Chyba: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const addLink = () => setFormData({ ...formData, links: [...formData.links, { title: '', url: '', iconUrl: '' }] })
  const addSocial = () => setFormData({ ...formData, socials: [...formData.socials, { platform: '', url: '', iconUrl: '' }] })

  return (
    <div className={styles.grid}>
      <div className={styles.cardList}>
        <button className={styles.button} onClick={handleNewCard}>+ Nová vizitka</button>
        {cards.map(c => (
          <div 
            key={c.id} 
            className={`${styles.cardItem} ${activeCardId === c.id ? styles.active : ''}`}
            onClick={() => handleSelectCard(c)}
          >
            <h3>{c.name}</h3>
            <p>{c.slug} - {c.company}</p>
          </div>
        ))}
      </div>

      <form className={styles.form} onSubmit={handleSave}>
        <h2>{activeCardId ? 'Úprava vizitky' : 'Nová vizitka'}</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '-1rem 0 1rem 0' }}>Není nutné vyplňovat vše – prázdná pole se na výsledné vizitce zkrátka nezobrazí.</p>
        
        <h3 className={styles.sectionTitle}>Základní údaje</h3>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Jméno</label>
            <input required className={styles.input} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>URL Slug</label>
            <input required className={styles.input} value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Pozice</label>
            <input className={styles.input} value={formData.jobTitle || ''} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Společnost</label>
            <input className={styles.input} value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} />
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Média a Vzhled</h3>
        <div className={styles.formGroup}>
          <label>URL Profilové fotky</label>
          <input className={styles.input} value={formData.profileImage || ''} onChange={e => setFormData({...formData, profileImage: e.target.value})} />
        </div>
        <div className={styles.formGroup}>
          <label>URL Fotky na pozadí (Cover)</label>
          <input className={styles.input} value={formData.coverImage || ''} onChange={e => setFormData({...formData, coverImage: e.target.value})} />
        </div>
        <div className={styles.formGroup}>
          <label>URL Loga firmy</label>
          <input className={styles.input} value={formData.companyLogo || ''} onChange={e => setFormData({...formData, companyLogo: e.target.value})} />
        </div>
        <div className={styles.formGroup}>
          <label>Hlavní barva (Theme Color HEX)</label>
          <input type="color" className={styles.input} style={{height: 50, padding: 5}} value={formData.themeColor || '#1A171B'} onChange={e => setFormData({...formData, themeColor: e.target.value})} />
        </div>

        <h3 className={styles.sectionTitle}>Kontaktní údaje</h3>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Mobil</label>
            <input className={styles.input} value={formData.mobile || ''} onChange={e => setFormData({...formData, mobile: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>E-mail</label>
            <input className={styles.input} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>WhatsApp</label>
            <input className={styles.input} value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>SMS</label>
            <input className={styles.input} value={formData.sms || ''} onChange={e => setFormData({...formData, sms: e.target.value})} />
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Adresa</h3>
        <div className={styles.formGroup}>
          <label>Název Místa / Titulek Adresy</label>
          <input className={styles.input} value={formData.addressTitle || ''} onChange={e => setFormData({...formData, addressTitle: e.target.value})} />
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Ulice</label>
            <input className={styles.input} value={formData.street || ''} onChange={e => setFormData({...formData, street: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Město</label>
            <input className={styles.input} value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>PSČ</label>
            <input className={styles.input} value={formData.zip || ''} onChange={e => setFormData({...formData, zip: e.target.value})} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Odkaz na Mapy</label>
          <input className={styles.input} value={formData.addressUrl || ''} onChange={e => setFormData({...formData, addressUrl: e.target.value})} />
        </div>

        <h3 className={styles.sectionTitle}>Webové odkazy</h3>
        <div className={styles.dynamicList}>
          {(formData.links || []).map((link: any, idx: number) => (
            <div key={idx} className={styles.dynamicItem}>
              <input placeholder="Titulek" className={styles.input} value={link.title} onChange={e => {
                const newLinks = [...(formData.links || [])]; newLinks[idx].title = e.target.value; setFormData({...formData, links: newLinks})
              }} />
              <input placeholder="URL" className={styles.input} value={link.url} onChange={e => {
                const newLinks = [...(formData.links || [])]; newLinks[idx].url = e.target.value; setFormData({...formData, links: newLinks})
              }} />
              <input placeholder="Ikona URL" className={styles.input} value={link.iconUrl || ''} onChange={e => {
                const newLinks = [...(formData.links || [])]; newLinks[idx].iconUrl = e.target.value; setFormData({...formData, links: newLinks})
              }} />
              <button type="button" onClick={() => setFormData({...formData, links: (formData.links || []).filter((_: any, i: number) => i !== idx)})}>X</button>
            </div>
          ))}
          <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} style={{marginTop: 10}} onClick={addLink}>Přidat odkaz</button>
        </div>

        <h3 className={styles.sectionTitle}>Sociální sítě</h3>
        <div className={styles.dynamicList}>
          {(formData.socials || []).map((social: any, idx: number) => (
            <div key={idx} className={styles.dynamicItem}>
              <input placeholder="Platforma (např. facebook)" className={styles.input} value={social.platform} onChange={e => {
                const newSoc = [...(formData.socials || [])]; newSoc[idx].platform = e.target.value; setFormData({...formData, socials: newSoc})
              }} />
              <input placeholder="URL profilu" className={styles.input} value={social.url} onChange={e => {
                const newSoc = [...(formData.socials || [])]; newSoc[idx].url = e.target.value; setFormData({...formData, socials: newSoc})
              }} />
              <input placeholder="Ikona URL" className={styles.input} value={social.iconUrl || ''} onChange={e => {
                 const newSoc = [...(formData.socials || [])]; newSoc[idx].iconUrl = e.target.value; setFormData({...formData, socials: newSoc})
              }} />
              <button type="button" onClick={() => setFormData({...formData, socials: (formData.socials || []).filter((_: any, i: number) => i !== idx)})}>X</button>
            </div>
          ))}
          <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} style={{marginTop: 10}} onClick={addSocial}>Přidat síť</button>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={loading} className={styles.button}>{loading ? 'Ukládám...' : 'Uložit'}</button>
          {activeCardId && (
            <>
              <button type="button" disabled={loading} onClick={handleDuplicate} className={styles.button} style={{background: '#666'}}>Duplikovat</button>
              <button type="button" disabled={loading} onClick={handleDelete} className={`${styles.button} ${styles.buttonDanger}`}>Smazat</button>
            </>
          )}
        </div>
      </form>

      {activeCardId && formData.slug && (
        <div style={{marginTop: '2rem'}}>
          <QRCodeGenerator 
            url={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/${formData.slug}`} 
            logoUrl={typeof formData.qrCodeLogo === 'string' ? formData.qrCodeLogo : (formData.companyLogo || '')}
            onLogoChange={(val) => setFormData({...formData, qrCodeLogo: val})}
            slug={formData.slug}
          />
        </div>
      )}
    </div>
  )
}
