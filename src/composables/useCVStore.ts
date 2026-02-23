import { ref, reactive, watch } from 'vue'
import type { PersonalData, DynamicItem, KursItem, AuszeichnungItem, SprachItem } from './useCVData'

// ── Module-level state (singleton, shared across all components) ──

const personalData = reactive<PersonalData>({
  name: '',
  geburtsdatum: '',
  geburtsort: '',
  adresse: '',
  telefon: '',
  email: '',
  photoUrl: '',
  photoOffsetX: 50,
  photoOffsetY: 50,
  photoZoom: 1,
})

const ausbildungen = ref<DynamicItem[]>([])
const berufserfahrungen = ref<DynamicItem[]>([])
const kurse = ref<KursItem[]>([])
const auszeichnungen = ref<AuszeichnungItem[]>([])
const kenntnisse = ref('')
const sprachen = ref<SprachItem[]>([])
const interessen = ref('')
const isSPADark = ref(false)
const mainSpacing = ref(1)
const sidebarSpacing = ref(1)
const isOverflowing = ref(false)
const dateErrors = ref<Set<number>>(new Set())

// ── ID Counters ──

let ausbildungCounter = 0
let berufserfahrungCounter = 0
let kurseCounter = 0
let auszeichnungenCounter = 0
let sprachenCounter = 0

// ── Date Validation ──

function parseDate(dateStr: string): number | null {
  if (!dateStr) return null

  const heute =
    dateStr.toLowerCase().includes('heute') ||
    dateStr.toLowerCase().includes('aktuell') ||
    dateStr.toLowerCase().includes('present')
  if (heute) return Date.now()

  const parts = dateStr.split(/[\/\-\.]/).map((p) => p.trim())
  if (parts.length === 2 && parts[0] && parts[1]) {
    const month = parseInt(parts[0])
    const year = parseInt(parts[1])
    if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
      return new Date(year, month - 1).getTime()
    }
  }
  if (parts.length === 1 && parts[0]) {
    const year = parseInt(parts[0])
    if (!isNaN(year) && year > 1900 && year < 2100) {
      return new Date(year, 0).getTime()
    }
  }
  return null
}

function validateDateRange(dateFrom: string, dateTo: string): boolean {
  if (!dateFrom || !dateTo) return true
  const fromTime = parseDate(dateFrom)
  const toTime = parseDate(dateTo)
  if (fromTime === null || toTime === null) return true
  return fromTime <= toTime
}

function checkAllDates() {
  const errors = new Set<number>()
  ausbildungen.value.forEach((item) => {
    if (!validateDateRange(item.dateFrom, item.dateTo)) {
      errors.add(item.id)
    }
  })
  berufserfahrungen.value.forEach((item) => {
    if (!validateDateRange(item.dateFrom, item.dateTo)) {
      errors.add(item.id)
    }
  })
  dateErrors.value = errors
}

// ── LocalStorage ──

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('cv-data')
    if (saved) {
      const data = JSON.parse(saved)
      Object.assign(personalData, data.personalData || {})

      ausbildungen.value = data.ausbildungen || []
      berufserfahrungen.value = data.berufserfahrungen || []
      kurse.value = data.kurse || []
      auszeichnungen.value = data.auszeichnungen || []

      if (typeof data.sprachen === 'string') {
        sprachen.value = []
      } else {
        sprachen.value = data.sprachen || []
      }

      kenntnisse.value = data.kenntnisse || ''
      interessen.value = data.interessen || ''
      mainSpacing.value = data.mainSpacing ?? 1
      sidebarSpacing.value = data.sidebarSpacing ?? 1
      isSPADark.value = data.isSPADark ?? false

      // Update counters
      ausbildungCounter =
        ausbildungen.value.length > 0
          ? Math.max(...ausbildungen.value.map((item) => item.id)) + 1
          : 0
      berufserfahrungCounter =
        berufserfahrungen.value.length > 0
          ? Math.max(...berufserfahrungen.value.map((item) => item.id)) + 1
          : 0
      kurseCounter =
        kurse.value.length > 0 ? Math.max(...kurse.value.map((item) => item.id)) + 1 : 0
      auszeichnungenCounter =
        auszeichnungen.value.length > 0
          ? Math.max(...auszeichnungen.value.map((item) => item.id)) + 1
          : 0
      sprachenCounter =
        sprachen.value.length > 0 ? Math.max(...sprachen.value.map((item) => item.id)) + 1 : 0
    }
  } catch (error) {
    console.error('Fehler beim Laden der Daten:', error)
  }
}

function saveToLocalStorage() {
  try {
    const data = {
      personalData,
      ausbildungen: ausbildungen.value,
      berufserfahrungen: berufserfahrungen.value,
      kurse: kurse.value,
      auszeichnungen: auszeichnungen.value,
      kenntnisse: kenntnisse.value,
      sprachen: sprachen.value,
      interessen: interessen.value,
      mainSpacing: mainSpacing.value,
      sidebarSpacing: sidebarSpacing.value,
      isSPADark: isSPADark.value,
    }
    localStorage.setItem('cv-data', JSON.stringify(data))
  } catch (error) {
    console.error('Fehler beim Speichern der Daten:', error)
  }
}

// ── CRUD Actions ──

function addAusbildung() {
  ausbildungen.value.push({
    id: ausbildungCounter++,
    title: '',
    subtitle: '',
    dateFrom: '',
    dateTo: '',
    description: '',
  })
}

function removeAusbildung(id: number) {
  ausbildungen.value = ausbildungen.value.filter((item) => item.id !== id)
}

function addBerufserfahrung() {
  berufserfahrungen.value.push({
    id: berufserfahrungCounter++,
    title: '',
    subtitle: '',
    dateFrom: '',
    dateTo: '',
    description: '',
  })
}

function removeBerufserfahrung(id: number) {
  berufserfahrungen.value = berufserfahrungen.value.filter((item) => item.id !== id)
}

function addKurs() {
  kurse.value.push({
    id: kurseCounter++,
    title: '',
    anbieter: '',
    datum: '',
  })
}

function removeKurs(id: number) {
  kurse.value = kurse.value.filter((item) => item.id !== id)
}

function addAuszeichnung() {
  auszeichnungen.value.push({
    id: auszeichnungenCounter++,
    title: '',
    verliehen: '',
    datum: '',
  })
}

function removeAuszeichnung(id: number) {
  auszeichnungen.value = auszeichnungen.value.filter((item) => item.id !== id)
}

function addSprache() {
  sprachen.value.push({
    id: sprachenCounter++,
    sprache: '',
    niveau: 'Grundkenntnisse',
  })
}

function removeSprache(id: number) {
  sprachen.value = sprachen.value.filter((item) => item.id !== id)
}

// ── Photo Management ──

const showPhotoPopup = ref(false)
const photoFileInputRef = ref<HTMLInputElement | null>(null)

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      personalData.photoUrl = e.target?.result as string
      personalData.photoOffsetX = 50
      personalData.photoOffsetY = 50
      personalData.photoZoom = 1
      showPhotoPopup.value = true
    }
    reader.readAsDataURL(file)
  }
  if (target) target.value = ''
}

function triggerPhotoReUpload() {
  photoFileInputRef.value?.click()
}

function openPhotoAdjustPopup() {
  if (personalData.photoUrl) {
    showPhotoPopup.value = true
  }
}

function resetPhotoPosition() {
  personalData.photoOffsetX = 50
  personalData.photoOffsetY = 50
  personalData.photoZoom = 1
}

function removePhoto() {
  personalData.photoUrl = ''
  personalData.photoOffsetX = 50
  personalData.photoOffsetY = 50
  personalData.photoZoom = 1
}

// ── Theme ──

function toggleTheme() {
  isSPADark.value = !isSPADark.value
}

// ── Overflow ──

function handleOverflow(detected: boolean) {
  isOverflowing.value = detected
}

// ── Composable ──

export function useCVStore() {
  return {
    // State
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
    isOverflowing,
    dateErrors,

    // Photo
    showPhotoPopup,
    photoFileInputRef,
    handleImageUpload,
    triggerPhotoReUpload,
    openPhotoAdjustPopup,
    resetPhotoPosition,
    removePhoto,

    // CRUD
    addAusbildung,
    removeAusbildung,
    addBerufserfahrung,
    removeBerufserfahrung,
    addKurs,
    removeKurs,
    addAuszeichnung,
    removeAuszeichnung,
    addSprache,
    removeSprache,

    // Theme & Overflow
    toggleTheme,
    handleOverflow,

    // Persistence
    loadFromLocalStorage,
    saveToLocalStorage,

    // Validation
    checkAllDates,
  }
}

/**
 * Initialize the store: load data, set up watchers.
 * Call once from the root component (CVGen.vue) inside setup/onMounted.
 */
export function initCVStore() {
  // Migrate old dark mode keys
  const saved = localStorage.getItem('cv-data')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      if (data.isDarkMode !== undefined && data.isSPADarkMode === undefined) {
        data.isSPADarkMode = false
        delete data.isDarkMode
        delete data.isCVDarkMode
        localStorage.setItem('cv-data', JSON.stringify(data))
      }
    } catch {
      // ignore parse errors
    }
  }

  loadFromLocalStorage()

  // Auto-save watcher
  watch(
    [
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
    ],
    () => {
      saveToLocalStorage()
    },
    { deep: true },
  )

  // Date validation watcher
  watch([ausbildungen, berufserfahrungen], () => checkAllDates(), { deep: true })
}
