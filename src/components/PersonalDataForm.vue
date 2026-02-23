<script setup lang="ts">
import { useCVStore } from '@/composables/useCVStore'
import PhotoAdjustPopup from './PhotoAdjustPopup.vue'

const {
  personalData,
  isSPADark,
  showPhotoPopup,
  photoFileInputRef,
  handleImageUpload,
  triggerPhotoReUpload,
  openPhotoAdjustPopup,
  resetPhotoPosition,
  removePhoto,
} = useCVStore()
</script>

<template>
  <div class="personal-data-form">
    <h2 class="section-title">Persönliche Daten</h2>

    <!-- Foto Upload -->
    <div class="form-group photo-upload-section">
      <label>Profilfoto</label>
      <div class="photo-upload-container">
        <div
          v-if="personalData.photoUrl"
          class="photo-preview"
          @click="openPhotoAdjustPopup"
          title="Klicken zum Anpassen"
        >
          <img
            :src="personalData.photoUrl"
            alt="Profilfoto"
            :style="{
              objectPosition: `${personalData.photoOffsetX ?? 50}% ${personalData.photoOffsetY ?? 50}%`,
              transform: `scale(${personalData.photoZoom ?? 1})`,
            }"
          />
          <button
            type="button"
            class="btn-remove-photo"
            @click.stop="removePhoto"
            title="Foto entfernen"
          >
            ✕
          </button>
        </div>
        <div v-else class="photo-upload-placeholder" @click="triggerPhotoReUpload">
          <div class="photo-upload-label">
            <span>📷</span>
            <span>Bild auswählen</span>
          </div>
        </div>
        <input
          ref="photoFileInputRef"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="photo-input"
        />
      </div>
    </div>

    <!-- Photo Adjustment Popup -->
    <PhotoAdjustPopup
      v-if="showPhotoPopup"
      :photo-url="personalData.photoUrl"
      :photo-offset-x="personalData.photoOffsetX ?? 50"
      :photo-offset-y="personalData.photoOffsetY ?? 50"
      :photo-zoom="personalData.photoZoom ?? 1"
      :is-dark="isSPADark"
      @update:photo-offset-x="personalData.photoOffsetX = $event"
      @update:photo-offset-y="personalData.photoOffsetY = $event"
      @update:photo-zoom="personalData.photoZoom = $event"
      @close="showPhotoPopup = false"
      @reset="resetPhotoPosition"
      @reupload="triggerPhotoReUpload"
    />

    <div class="form-group">
      <label>Name</label>
      <input type="text" v-model="personalData.name" placeholder="Max Mustermann" />
    </div>
    <div class="two-column">
      <div class="form-group">
        <label>Geburtsdatum</label>
        <input type="date" v-model="personalData.geburtsdatum" />
      </div>
      <div class="form-group">
        <label>Geburtsort</label>
        <input type="text" v-model="personalData.geburtsort" placeholder="Berlin" />
      </div>
    </div>
    <div class="form-group">
      <label>Adresse</label>
      <input
        type="text"
        v-model="personalData.adresse"
        placeholder="Musterstraße 123, 12345 Berlin"
      />
    </div>
    <div class="two-column">
      <div class="form-group">
        <label>Telefon</label>
        <input type="tel" v-model="personalData.telefon" placeholder="+49 123 456789" />
      </div>
      <div class="form-group">
        <label>E-Mail</label>
        <input type="email" v-model="personalData.email" placeholder="max@beispiel.de" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 1.5em;
  color: #2d3748;
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #2d3748;
  transition:
    color 0.3s ease,
    border-color 0.3s ease;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #1e293b;
  transition: color 0.3s ease;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 2px solid #cbd5e0;
  border-radius: 5px;
  font-size: 14px;
  background: white;
  color: #1e293b;
  transition:
    border-color 0.3s,
    background-color 0.3s,
    color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #2d3748;
}

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Photo Upload Styles */
.photo-upload-section {
  margin-bottom: 20px;
}

.photo-upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.photo-preview {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #2d3748;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.photo-preview:hover {
  border-color: #1a73e8;
  box-shadow: 0 4px 14px rgba(26, 115, 232, 0.3);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-photo {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.btn-remove-photo:hover {
  background: rgba(255, 59, 48, 1);
  transform: scale(1.1);
}

.photo-upload-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px dashed #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-upload-placeholder:hover {
  border-color: #1e293b;
  background: #f1f5f9;
  transform: scale(1.05);
}

.photo-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-align: center;
  padding: 20px;
}

.photo-upload-label span:last-child {
  font-size: 14px;
  color: #2d3748;
  font-weight: 600;
  transition: color 0.3s ease;
}

.photo-input {
  display: none;
}

@media (max-width: 968px) {
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>
