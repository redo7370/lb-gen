<script setup lang="ts">
import CVPreview from './CVPreview.vue'
import { useCVStore } from '@/composables/useCVStore'

const {
  personalData,
  ausbildungen,
  berufserfahrungen,
  kurse,
  auszeichnungen,
  kenntnisse,
  sprachen,
  interessen,
  mainSpacing,
  sidebarSpacing,
  isSPADark,
  isOverflowing,
  handleOverflow,
} = useCVStore()

const emit = defineEmits<{
  exportPdf: []
}>()
</script>

<template>
  <div class="preview-section" :class="{ dark: isSPADark }">
    <div class="spacing-controls" :class="{ dark: isSPADark }">
      <div class="spacing-control">
        <label>
          Hauptbereich Abstände: <strong>{{ Math.round(mainSpacing * 100) }}%</strong>
        </label>
        <input
          type="range"
          min="20"
          max="150"
          :value="mainSpacing * 100"
          @input="mainSpacing = Number(($event.target as HTMLInputElement).value) / 100"
        />
      </div>
      <div class="spacing-control">
        <label>
          Seitenleiste Abstände: <strong>{{ Math.round(sidebarSpacing * 100) }}%</strong>
        </label>
        <input
          type="range"
          min="20"
          max="150"
          :value="sidebarSpacing * 100"
          @input="sidebarSpacing = Number(($event.target as HTMLInputElement).value) / 100"
        />
      </div>
    </div>

    <div v-if="isOverflowing" class="overflow-warning" :class="{ dark: isSPADark }">
      ⚠️ Der Inhalt überschreitet eine A4-Seite! Die rot markierten Bereiche in der Vorschau werden
      im PDF abgeschnitten. Bitte Einträge kürzen/entfernen oder Abstände verkleinern.
    </div>

    <button class="btn btn-export" :class="{ dark: isSPADark }" @click="emit('exportPdf')">
      📥 Als PDF exportieren
    </button>

    <CVPreview
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
      :is-s-p-a-dark="isSPADark"
      @overflow="handleOverflow"
    />
  </div>
</template>

<style scoped>
.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #e2e8f0;
  padding: 20px;
  min-width: 0;
  transition: background-color 0.3s ease;
}

.preview-section.dark {
  background: #0f172a;
}

.preview-section > :last-child {
  flex: 1;
  overflow: hidden;
}

/* Spacing Controls */
.spacing-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  padding: 10px 14px;
  background: #f1f5f9;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.spacing-controls.dark {
  background: #1e293b;
}

.spacing-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spacing-control label {
  font-size: 11px;
  color: #475569;
  transition: color 0.3s ease;
}

.spacing-controls.dark .spacing-control label {
  color: #94a3b8;
}

.spacing-control strong {
  color: #667eea;
}

.spacing-control input[type='range'] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #cbd5e0;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.spacing-controls.dark .spacing-control input[type='range'] {
  background: #475569;
}

.spacing-control input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

/* Overflow Warning */
.overflow-warning {
  background: #fef2f2;
  border: 2px solid #dc3545;
  color: #991b1b;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.4;
}

.overflow-warning.dark {
  background: #450a0a;
  color: #fca5a5;
  border-color: #dc3545;
}

/* Export Button */
.btn-export {
  background: #2d3748;
  color: white;
  font-size: 16px;
  padding: 12px 30px;
  display: block;
  margin: 0 auto 15px auto;
  box-shadow: 0 4px 12px rgba(45, 55, 72, 0.4);
  flex-shrink: 0;
  transition: all 0.3s ease;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}

.btn-export.dark {
  background: #475569;
  box-shadow: 0 4px 12px rgba(71, 85, 105, 0.6);
}

.btn-export:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(45, 55, 72, 0.6);
}

.btn-export.dark:hover {
  background: #64748b;
}
</style>
