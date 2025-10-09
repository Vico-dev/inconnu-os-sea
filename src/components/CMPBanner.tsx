"use client"

import { useEffect, useState } from "react"

// Minimal open-source-like CMP fallback to unlock Consent Mode v2
export default function CMPBanner() {
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [ads, setAds] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)

  useEffect(() => {
    // show if no consent stored
    const hasConsent = document.cookie.includes("cmp-consent=")
    if (!hasConsent) setVisible(true)

    // set default denied
    ;(window as any).dataLayer = (window as any).dataLayer || []
    function gtag(){ (window as any).dataLayer.push(arguments) }
    gtag('consent','default',{
      ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'
    })
  }, [])

  const acceptAll = () => {
    updateConsent(true,true)
  }
  const denyAll = () => {
    updateConsent(false,false)
  }

  function updateConsent(analytics: boolean, ads: boolean) {
    ;(window as any).dataLayer = (window as any).dataLayer || []
    function gtag(){ (window as any).dataLayer.push(arguments) }
    gtag('consent','update',{
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: ads ? 'granted' : 'denied',
      ad_user_data: ads ? 'granted' : 'denied',
      ad_personalization: ads ? 'granted' : 'denied',
    })
    document.cookie = `cmp-consent=${analytics?"1":"0"}${ads?"1":"0"}; path=/; max-age=${60*60*24*365}`
    setVisible(false)
    ;(window as any).dataLayer.push({event:'consent_updated'})
  }

  // Lock/unlock scroll when visible
  useEffect(() => {
    if (visible) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [visible])

  if (!visible) return null

  return (
    <div style={{
      position:'fixed',inset:0 as any,zIndex:2147483647,
      display:'grid',placeItems:'center'
    }}>
      {/* Overlay */}
      <div style={{
        position:'absolute',inset:0 as any,background:'rgba(2,6,23,.78)',backdropFilter:'blur(2px)'
      }} />
      {/* Modal */}
      <div style={{
        position:'relative',maxWidth:720,width:'92%',
        background:'#0f172a',color:'#e5e7eb',
        border:'1px solid rgba(255,255,255,.06)',borderRadius:14,
        boxShadow:'0 18px 60px rgba(0,0,0,.55)'
      }}>
        <div style={{padding:'22px 22px 16px'}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{fontSize:16,fontWeight:700,color:'#fff',marginBottom:6}}>
              Votre confidentialité, notre priorité
            </div>
            <div style={{fontSize:13,opacity:.9,lineHeight:1.5}}>
              Nous utilisons des cookies pour améliorer votre expérience, mesurer l’audience (GA4)
              et optimiser nos campagnes Google Ads. Vous pouvez personnaliser vos choix.
            </div>
            {showPrefs && (
              <div style={{marginTop:12,display:'flex',gap:18,flexWrap:'wrap'}}>
                <label style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} />
                  <span>Mesure d’audience (GA4)</span>
                </label>
                <label style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="checkbox" checked={ads} onChange={e=>setAds(e.target.checked)} />
                  <span>Publicité (Google Ads)</span>
                </label>
              </div>
            )}
            <button onClick={()=>setShowPrefs(v=>!v)} style={{
              marginTop:10,background:'transparent',border:'none',color:'#93c5fd',textDecoration:'underline',cursor:'pointer'
            }}>{showPrefs? 'Masquer les préférences' : 'Personnaliser mes choix'}</button>
          </div>
        </div>
        <div style={{
          display:'flex',gap:10,alignItems:'center',justifyContent:'flex-end',
          padding:'12px 16px',background:'rgba(255,255,255,.03)',borderTop:'1px solid rgba(255,255,255,.06)',
          borderBottomLeftRadius:14,borderBottomRightRadius:14
        }}>
          <button onClick={denyAll} style={{
            padding:'10px 14px',background:'transparent',border:'1px solid #475569',
            color:'#cbd5e1',borderRadius:10
          }}>Tout refuser</button>
          <button onClick={()=>updateConsent(analytics, ads)} style={{
            padding:'12px 16px',background:'#0ea5e9',color:'#03131e',borderRadius:10,fontWeight:700
          }}>Enregistrer</button>
          <button onClick={acceptAll} style={{
            padding:'12px 18px',background:'#22c55e',color:'#052e1b',
            borderRadius:10,fontWeight:800,boxShadow:'0 6px 18px rgba(34,197,94,.35)'
          }}>Tout accepter</button>
        </div>
      </div>
    </div>
  )
}


