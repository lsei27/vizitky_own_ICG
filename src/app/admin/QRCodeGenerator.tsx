'use client'

import React, { useEffect, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import styles from './admin.module.css'

export default function QRCodeGenerator({ url, defaultLogo, slug }: { url: string, defaultLogo?: string, slug: string }) {
  const [logoUrl, setLogoUrl] = useState(defaultLogo || '')
  const ref = useRef<HTMLDivElement>(null)
  const qrCode = useRef<any>(null)

  useEffect(() => {
    // We instantiate it dynamically on client to avoid SSR issues
    qrCode.current = new QRCodeStyling({
      width: 1080,
      height: 1080,
      data: url,
      image: logoUrl,
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: {
        color: "#222222",
        type: "dots"
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#333333"
      },
      cornersDotOptions: {
        type: "square",
        color: "#333333"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 20,
        imageSize: 0.4
      }
    })
    
    if (ref.current) {
      ref.current.innerHTML = ''
      qrCode.current.append(ref.current)
    }
  }, [url]) // only recreate when core URL changes to not constantly flash

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({ image: logoUrl })
    }
  }, [logoUrl])

  const handleDownload = async () => {
    if (!qrCode.current) return
    // Temporarily update size to 2000px for 2K export
    qrCode.current.update({ width: 2000, height: 2000 })
    await qrCode.current.download({ name: `${slug}-vizitka-qr`, extension: "png" })
    
    // Revert back to UI size
    qrCode.current.update({ width: 1080, height: 1080 })
  }

  return (
    <div style={{ border: '1px solid #eaeaea', padding: '1.5rem', borderRadius: '8px', background: '#fdfdfd', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 className={styles.sectionTitle} style={{marginTop: 0}}>Generátor QR Kódu</h3>
      
      <div className={styles.formGroup}>
        <label>URL Logo obrázku (zobrazí se uprostřed QR kódu)</label>
        <input 
          className={styles.input} 
          value={logoUrl} 
          onChange={e => setLogoUrl(e.target.value)} 
          placeholder="https://...odkaz-na-logo.png"
        />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .qr-preview-admin canvas {
          width: 100% !important;
          height: auto !important;
          max-width: 300px;
        }
      `}} />
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div ref={ref} className="qr-preview-admin" style={{ border: '1px solid #eee', borderRadius: '16px', padding: '1rem', background: 'white', width: '300px', display: 'flex' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', maxWidth: '300px', wordBreak: 'break-all' }}>
            Tento QR kód odkazuje návštěvníka na: <br/><strong>{url}</strong>
          </p>
          <button type="button" onClick={handleDownload} className={styles.button}>
            Stáhnout ve vysokém 2K rozlišení (PNG)
          </button>
        </div>
      </div>
    </div>
  )
}
