"use client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Une erreur est survenue</h1>
        <p className="text-gray-600 mb-4">{error.message || "Veuillez réessayer."}</p>
        <button onClick={reset} className="px-4 py-2 rounded bg-blue-600 text-white">Réessayer</button>
      </div>
    </div>
  )
}