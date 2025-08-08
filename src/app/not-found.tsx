export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Page introuvable</h1>
        <p className="text-gray-600">La page que vous cherchez n'existe pas.</p>
      </div>
    </div>
  )
}