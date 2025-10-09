"use client"

import { useEffect, useState } from "react"

// Minimal open-source-like CMP fallback to unlock Consent Mode v2
export default function CMPBanner() {
  const [visible, setVisible] = useState(false)

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

  if (!visible) return null

  return (
    <div style={{
      position:'fixed',left:0,right:0,bottom:0,zIndex:2147483647,
      background:'#0f172a',color:'#fff',padding:'16px',boxShadow:'0 -4px 12px rgba(0,0,0,.2)'
    }}>
      <div style={{maxWidth:960,margin:'0 auto',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:260}}>
          Nous utilisons des cookies pour la mesure d'audience (GA4) et la publicité (Google Ads).
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={denyAll} style={{padding:'10px 14px',background:'#334155',color:'#fff',borderRadius:8}}>Tout refuser</button>
          <button onClick={acceptAll} style={{padding:'10px 14px',background:'#10b981',color:'#0b1c1a',borderRadius:8,fontWeight:700}}>Tout accepter</button>
        </div>
      </div>
    </div>
  )
}


