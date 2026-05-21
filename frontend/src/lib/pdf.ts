import { apiUrl, apiHeaders } from './api'

export async function generatePdf(markdown: string): Promise<void> {
  const response = await fetch(apiUrl('/api/generate-pdf'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...apiHeaders() },
    body: JSON.stringify({ markdown }),
  })

  if (!response.ok) throw new Error('Failed to generate PDF')

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'oilbird-document.pdf'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
