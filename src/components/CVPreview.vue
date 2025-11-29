<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CVA4Template from './CVA4Template.vue'
import type { CVProps } from '@/composables/useCVData'

const props = defineProps<CVProps>()

// Ref to A4 template component
const a4TemplateRef = ref<InstanceType<typeof CVA4Template> | null>(null)

// SPA dark mode for zoom controls styling only
const spaIsDark = computed(() => props.isSPADark ?? false)

// Zoom Controls Classes
const zoomControlsClasses = computed(() => ({
  dark: spaIsDark.value,
}))

// A4 dark mode state - synced via events
const a4DarkMode = ref(false)

// Load initial A4 dark mode state from localStorage
onMounted(() => {
  const saved = localStorage.getItem('cv-a4-dark-mode')
  if (saved !== null) {
    a4DarkMode.value = saved === 'true'
  }
})

// Handle toggle from template button - calls A4 component method
const handleToggleA4Theme = () => {
  if (a4TemplateRef.value) {
    a4TemplateRef.value.toggleA4Dark()
  }
}

// Handle dark mode change event from A4 component
const handleA4DarkModeChange = (value: boolean) => {
  a4DarkMode.value = value
}

// Zoom und Pan State
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const containerRef = ref<HTMLElement | null>(null)

// Zoom Funktionen
const zoomIn = () => {
  if (zoom.value < 2) {
    zoom.value = Math.min(zoom.value + 0.1, 2)
  }
}

const zoomOut = () => {
  if (zoom.value > 0.5) {
    zoom.value = Math.max(zoom.value - 0.1, 0.5)
  }
}

const resetZoom = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

// Pan Funktionen
const handleMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    // Nur linke Maustaste
    isDragging.value = true
    dragStartX.value = e.clientX - panX.value
    dragStartY.value = e.clientY - panY.value
    e.preventDefault()
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    panX.value = e.clientX - dragStartX.value
    panY.value = e.clientY - dragStartY.value
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = -e.deltaY * 0.001
    zoom.value = Math.max(0.5, Math.min(2, zoom.value + delta))
  }
}
</script>

<template>
  <div class="cv-preview-wrapper">
    <!-- Zoom Controls (folgen SPA Dark Mode vom Navbar-Button) -->
    <div class="zoom-controls" :class="zoomControlsClasses">
      <button @click="zoomOut" class="zoom-btn" title="Verkleinern">−</button>
      <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
      <button @click="zoomIn" class="zoom-btn" title="Vergrößern">+</button>
      <button @click="resetZoom" class="zoom-btn reset-btn" title="Zurücksetzen">↺</button>
      <div class="controls-divider"></div>
      <!-- Theme-Button steuert A4 Template Dark Mode (INDEPENDENT) -->
      <button
        @click="handleToggleA4Theme"
        class="zoom-btn theme-btn"
        type="button"
        title="A4 Template Theme umschalten"
      >
        <span v-if="a4DarkMode">☀️</span>
        <span v-else>🌙</span>
      </button>
    </div>

    <!-- Scrollable Container -->
    <div
      class="cv-preview-container"
      ref="containerRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
      :class="{ dragging: isDragging }"
    >
      <div
        class="cv-preview-page"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        }"
      >
        <!-- A4 Template Component - COMPLETELY ISOLATED -->
        <CVA4Template
          ref="a4TemplateRef"
          :personal-data="personalData"
          :ausbildungen="ausbildungen"
          :berufserfahrungen="berufserfahrungen"
          :kurse="kurse"
          :auszeichnungen="auszeichnungen"
          :kenntnisse="kenntnisse"
          :sprachen="sprachen"
          :interessen="interessen"
          @dark-mode-change="handleA4DarkModeChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Wrapper für die gesamte Preview */
.cv-preview-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: transparent;
  overflow: hidden;
}

/* Zoom Controls */
.zoom-controls {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.zoom-controls.dark {
  background: #2d3748;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

.zoom-btn:hover {
  background: #5568d3;
  transform: scale(1.1);
}

.zoom-btn:active {
  transform: scale(0.95);
}

.reset-btn {
  background: #6c757d;
}

.reset-btn:hover {
  background: #5a6268;
}

.theme-btn {
  font-size: 16px;
  padding: 6px 12px;
  background: #f59e0b;
}

.theme-btn:hover {
  background: #d97706;
}

.controls-divider {
  width: 1px;
  height: 24px;
  background: #ddd;
  margin: 0 5px;
  transition: background-color 0.3s ease;
}

.zoom-controls.dark .controls-divider {
  background: #4a5568;
}

.zoom-controls.dark button,
.zoom-controls.dark .zoom-level {
  color: #e2e8f0;
  border-color: #4a5568;
}

.zoom-level {
  min-width: 50px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

.zoom-controls.dark .zoom-level {
  color: #e2e8f0;
}

/* Scrollable Container */
.cv-preview-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  cursor: grab;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px 20px 20px;
}

.cv-preview-container.dragging {
  cursor: grabbing;
  user-select: none;
}

/* A4 Page */
.cv-preview-page {
  transform-origin: center center;
  transition: transform 0.05s ease-out;
  will-change: transform;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

@media print {
  .zoom-controls {
    display: none;
  }

  .cv-preview-wrapper {
    background: white;
  }

  .cv-preview-container {
    padding: 0;
  }

  .cv-preview-page {
    transform: none !important;
    box-shadow: none;
  }
}
</style>
