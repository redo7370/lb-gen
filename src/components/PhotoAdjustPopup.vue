<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  photoUrl: string
  photoOffsetX: number
  photoOffsetY: number
  photoZoom: number
  isDark: boolean
}>()

const emit = defineEmits<{
  'update:photoOffsetX': [value: number]
  'update:photoOffsetY': [value: number]
  'update:photoZoom': [value: number]
  close: []
  reset: []
  reupload: []
}>()

const previewStyle = computed(() => ({
  objectPosition: `${props.photoOffsetX}% ${props.photoOffsetY}%`,
  transform: `scale(${props.photoZoom})`,
}))

function onZoomInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  emit('update:photoZoom', value / 100)
}
</script>

<template>
  <Teleport to="body">
    <div class="photo-popup-overlay" @click.self="emit('close')">
      <div class="photo-popup" :class="{ dark: isDark }">
        <h3>Bild ausrichten</h3>
        <p class="popup-hint">
          Passen Sie die Position und den Zoom an, damit Ihr Gesicht richtig im Kreis angezeigt
          wird.
        </p>

        <!-- Live Circle Preview -->
        <div class="popup-preview-circle">
          <img :src="photoUrl" alt="Vorschau" :style="previewStyle" />
        </div>

        <!-- Controls -->
        <div class="popup-controls">
          <div class="popup-control-group">
            <label
              >Horizontal: <strong>{{ photoOffsetX }}%</strong></label
            >
            <input
              type="range"
              min="0"
              max="100"
              :value="photoOffsetX"
              @input="
                emit('update:photoOffsetX', Number(($event.target as HTMLInputElement).value))
              "
            />
          </div>
          <div class="popup-control-group">
            <label
              >Vertikal: <strong>{{ photoOffsetY }}%</strong></label
            >
            <input
              type="range"
              min="0"
              max="100"
              :value="photoOffsetY"
              @input="
                emit('update:photoOffsetY', Number(($event.target as HTMLInputElement).value))
              "
            />
          </div>
          <div class="popup-control-group">
            <label
              >Zoom: <strong>{{ Math.round(photoZoom * 100) }}%</strong></label
            >
            <input type="range" min="100" max="300" :value="photoZoom * 100" @input="onZoomInput" />
          </div>
        </div>

        <div class="popup-actions">
          <button type="button" class="btn popup-btn-upload" @click="emit('reupload')">
            📷 Neues Bild
          </button>
          <button type="button" class="btn popup-btn-reset" @click="emit('reset')">
            ↺ Zurücksetzen
          </button>
          <button type="button" class="btn popup-btn-done" @click="emit('close')">✓ Fertig</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.photo-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.photo-popup {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.photo-popup.dark {
  background: #1e293b;
  color: #e2e8f0;
}

.photo-popup h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  transition: color 0.3s ease;
}

.photo-popup.dark h3 {
  color: #f1f5f9;
}

.popup-hint {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 20px 0;
  transition: color 0.3s ease;
}

.photo-popup.dark .popup-hint {
  color: #94a3b8;
}

.popup-preview-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
  border: 3px solid #2d3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: border-color 0.3s ease;
}

.photo-popup.dark .popup-preview-circle {
  border-color: #475569;
}

.popup-preview-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.popup-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  text-align: left;
}

.popup-control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.popup-control-group label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  transition: color 0.3s ease;
}

.photo-popup.dark .popup-control-group label {
  color: #94a3b8;
}

.popup-control-group input[type='range'] {
  width: 100%;
  accent-color: #2d3748;
}

.popup-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.popup-btn-upload {
  background: #475569;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.popup-btn-upload:hover {
  background: #334155;
}

.popup-btn-reset {
  background: #e2e8f0;
  color: #334155;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.popup-btn-reset:hover {
  background: #cbd5e1;
}

.photo-popup.dark .popup-btn-reset {
  background: #334155;
  color: #e2e8f0;
}

.photo-popup.dark .popup-btn-reset:hover {
  background: #475569;
}

.popup-btn-done {
  background: #2d3748;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.popup-btn-done:hover {
  background: #1e293b;
}
</style>
