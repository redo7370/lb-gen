<script setup lang="ts">
import { onMounted } from 'vue'
import CVA4Template from './CVA4Template.vue'
import NavBar from './NavBar.vue'
import CVFormSidebar from './CVFormSidebar.vue'
import PreviewSection from './PreviewSection.vue'
import { useCVStore, initCVStore } from '@/composables/useCVStore'
import { usePDFExport } from '@/composables/usePDFExport'

const {
  personalData,
  ausbildungen,
  berufserfahrungen,
  kurse,
  auszeichnungen,
  kenntnisse,
  sprachen,
  interessen,
  isSPADark,
  mainSpacing,
  sidebarSpacing,
} = useCVStore()

const { cvPdfA4Ref, pdfContainerRef, exportPDF } = usePDFExport()

onMounted(() => {
  initCVStore()
})
</script>

<template>
  <div class="container" :class="{ 'dark-mode': isSPADark }">
    <!-- Navbar -->
    <NavBar />

    <div class="content">
      <!-- Form Section -->
      <CVFormSidebar />

      <!-- Preview Section -->
      <PreviewSection @export-pdf="exportPDF" />
    </div>

    <!-- Hidden A4 Template for PDF Export (identical to preview) -->
    <div class="pdf-container" ref="pdfContainerRef">
      <CVA4Template
        ref="cvPdfA4Ref"
        :personal-data="personalData"
        :ausbildungen="ausbildungen"
        :berufserfahrungen="berufserfahrungen"
        :kurse="kurse"
        :auszeichnungen="auszeichnungen"
        :kenntnisse="kenntnisse"
        :sprachen="sprachen"
        :interessen="interessen"
        :main-spacing="mainSpacing"
        :sidebar-spacing="sidebarSpacing"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  background: #f8fafc;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
}

.container.dark-mode {
  background: #0f172a;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 968px) {
  .content {
    flex-direction: column;
  }
}

/* Hide PDF template from view */
.pdf-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 210mm;
  height: 297mm;
  visibility: hidden;
  overflow: hidden;
  pointer-events: none;
}
</style>
