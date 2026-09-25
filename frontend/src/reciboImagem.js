import html2canvas from 'html2canvas'

export async function gerarEcompartilharImagem(elemento, nomeArquivo, legenda) {
  const canvas = await html2canvas(elemento, { scale: 2, backgroundColor: '#ffffff' })
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Não foi possível gerar a imagem do recibo.')

  const arquivo = new File([blob], nomeArquivo, { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
    await navigator.share({ files: [arquivo], text: legenda })
    return 'compartilhado'
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
  return 'baixado'
}
