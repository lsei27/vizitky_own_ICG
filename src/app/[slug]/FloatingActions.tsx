'use client'

import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import styles from './card.module.css'

export default function FloatingActions({ cardId, slug, logoUrl, themeColor }: { cardId: string, slug: string, logoUrl: string, themeColor: string }) {
  const [showQR, setShowQR] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showQR && qrRef.current) {
      const qrCode = new QRCodeStyling({
        width: 250,
        height: 250,
        data: `${window.location.origin}/${slug}`,
        image: logoUrl,
        dotsOptions: { color: "#222", type: "dots" },
        cornersSquareOptions: { type: "extra-rounded", color: themeColor },
        cornersDotOptions: { type: "square", color: themeColor },
        imageOptions: { crossOrigin: "anonymous", margin: 10, imageSize: 0.4 }
      })
      qrRef.current.innerHTML = ''
      qrCode.append(qrRef.current)
    }
  }, [showQR, slug, logoUrl, themeColor])

  return (
    <>
      <a href={`/api/vcard/${cardId}`} className={styles.floatingBtnRight} style={{backgroundColor: themeColor}}>
        <span>Přidat kontakt</span>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </a>

      <button onClick={() => setShowQR(true)} className={styles.floatingBtnLeft} style={{backgroundColor: themeColor}} title="Zobrazit QR kód">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h-3v2h3v-2zm-3 4h-2v2h2v-2zm2-2h2v2h-2v-2zm-2 4h-2v2h2v-2zm2-2h2v2h-2v-2z"/>
        </svg>
      </button>

      {showQR && (
        <div className={styles.modalOverlay} onClick={() => setShowQR(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowQR(false)}>✕</button>
            <h3 style={{marginTop: 0, textAlign: 'center', color: '#333'}}>Zobrazit kód</h3>
            <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', background: 'white', padding: '1rem', borderRadius: '16px' }}></div>
          </div>
        </div>
      )}
    </>
  )
}
