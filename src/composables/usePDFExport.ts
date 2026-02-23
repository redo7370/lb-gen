import { ref } from 'vue'
import CVA4Template from '@/components/CVA4Template.vue'
import html2pdf from 'html2pdf.js'

/**
 * Composable for PDF export logic.
 * Returns template refs that must be bound in the parent template,
 * plus the exportPDF function.
 */
export function usePDFExport() {
  const cvPdfA4Ref = ref<InstanceType<typeof CVA4Template> | null>(null)
  const pdfContainerRef = ref<HTMLElement | null>(null)

  async function exportPDF() {
    const container = pdfContainerRef.value
    if (!container) {
      console.error('PDF container not found')
      return
    }

    const templateElement = container.querySelector('.cv-a4-template') as HTMLElement | null
    if (!templateElement) {
      console.error('PDF Template Element not found')
      return
    }

    // Make container visible for html2canvas rendering
    container.style.position = 'fixed'
    container.style.left = '0'
    container.style.top = '0'
    container.style.visibility = 'visible'
    container.style.zIndex = '-1'
    container.style.overflow = 'visible'
    container.style.height = 'auto'

    // For PDF: use min-height so backgrounds extend to bottom
    templateElement.style.height = 'auto'
    templateElement.style.minHeight = '297mm'
    templateElement.style.overflow = 'hidden'

    // Remove overflow-item markers for clean PDF
    templateElement.querySelectorAll('.overflow-item').forEach((item) => {
      item.classList.remove('overflow-item')
    })

    // Wait for layout to settle
    await new Promise((resolve) => requestAnimationFrame(resolve))
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Calculate A4 page height in pixels
    const renderedWidth = templateElement.offsetWidth
    const a4Ratio = 297 / 210
    const pageHeightPx = renderedWidth * a4Ratio

    const opt = {
      margin: 0,
      filename: 'Lebenslauf.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
        width: renderedWidth,
        height: pageHeightPx,
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        compress: true,
      },
    }

    try {
      await html2pdf().set(opt).from(templateElement).save()
    } catch (error) {
      console.error('PDF Export Error:', error)
      alert('Fehler beim PDF-Export. Bitte versuchen Sie es erneut.')
    } finally {
      // Restore styles
      templateElement.style.height = ''
      templateElement.style.minHeight = ''
      templateElement.style.overflow = ''
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '-9999px'
      container.style.visibility = 'hidden'
      container.style.zIndex = ''
      container.style.overflow = ''
      container.style.height = ''
    }
  }

  return {
    cvPdfA4Ref,
    pdfContainerRef,
    exportPDF,
  }
}
