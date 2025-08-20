import { NextPageContext } from 'next'

interface ErrorProps {
  statusCode?: number
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: '#333' }}>
        {statusCode || 'Erreur'}
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '1rem' }}>
        {statusCode
          ? `Une erreur ${statusCode} s'est produite sur le serveur`
          : 'Une erreur s\'est produite côté client'}
      </p>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error 