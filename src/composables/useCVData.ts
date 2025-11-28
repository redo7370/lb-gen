import { computed } from 'vue'

export interface PersonalData {
  name: string
  geburtsdatum: string
  geburtsort: string
  adresse: string
  telefon: string
  email: string
  photoUrl: string
}

export interface DynamicItem {
  id: number
  title: string
  subtitle: string
  dateFrom: string
  dateTo: string
  description?: string
}

export interface KursItem {
  id: number
  title: string
  anbieter: string
  datum: string
}

export interface AuszeichnungItem {
  id: number
  title: string
  verliehen: string
  datum: string
}

export interface SprachItem {
  id: number
  sprache: string
  niveau:
    | 'Grundkenntnisse'
    | 'Konversationsfähig'
    | 'Gut'
    | 'Professionell'
    | 'Fließend'
    | 'Muttersprache'
}

export interface CVProps {
  personalData: PersonalData
  ausbildungen: DynamicItem[]
  berufserfahrungen: DynamicItem[]
  kurse: KursItem[]
  auszeichnungen: AuszeichnungItem[]
  kenntnisse: string
  sprachen: SprachItem[]
  interessen: string
  isA4Dark?: boolean // A4 template dark mode - managed internally by CVA4Template
  isSPADark?: boolean // SPA dark mode - for zoom controls styling only
}

/**
 * Composable für gemeinsame CV-Datenverarbeitung
 */
export function useCVData(props: CVProps) {
  // Hilfsfunktion zum Parsen von Datumsangaben
  const parseDate = (dateStr: string): number => {
    if (!dateStr) return 0
    // Versuche verschiedene Formate: MM/YYYY, YYYY, oder "heute"/"aktuell"
    const heute =
      dateStr.toLowerCase().includes('heute') ||
      dateStr.toLowerCase().includes('aktuell') ||
      dateStr.toLowerCase().includes('present')
    if (heute) return Date.now()

    const parts = dateStr.split(/[\/\-\.]/).map((p) => p.trim())
    if (parts.length === 2 && parts[0] && parts[1]) {
      // MM/YYYY Format
      const month = parseInt(parts[0])
      const year = parseInt(parts[1])
      return new Date(year, month - 1).getTime()
    } else if (parts.length === 1 && parts[0]) {
      // Nur Jahr
      const year = parseInt(parts[0])
      return new Date(year, 0).getTime()
    }
    return 0
  }

  // Konvertiert Sprachniveau zu numerischem Wert für Balkenanzeige
  const getLevelValue = (niveau: string): number => {
    const levels: { [key: string]: number } = {
      Grundkenntnisse: 1,
      Konversationsfähig: 2,
      Gut: 3,
      Professionell: 4,
      Fließend: 5,
      Muttersprache: 6,
    }
    return levels[niveau] || 0
  }

  // Computed Properties
  const geburtsText = computed(() => {
    if (!props.personalData.geburtsdatum && !props.personalData.geburtsort) return ''
    let text = ''
    if (props.personalData.geburtsdatum) {
      text += new Date(props.personalData.geburtsdatum).toLocaleDateString('de-DE')
    }
    if (props.personalData.geburtsort) {
      text += (props.personalData.geburtsdatum ? ', ' : '') + props.personalData.geburtsort
    }
    return text
  })

  const kenntnisseArray = computed(() => {
    return props.kenntnisse
      .split(',')
      .map((k: string) => k.trim())
      .filter((k: string) => k)
  })

  const interessenArray = computed(() => {
    return props.interessen
      .split(',')
      .map((i: string) => i.trim())
      .filter((i: string) => i)
  })

  // Sortierte Listen (neueste zuerst)
  const sortedAusbildungen = computed(() => {
    return [...props.ausbildungen].sort((a, b) => {
      const dateA = parseDate(a.dateTo || a.dateFrom)
      const dateB = parseDate(b.dateTo || b.dateFrom)
      return dateB - dateA
    })
  })

  const sortedBerufserfahrungen = computed(() => {
    return [...props.berufserfahrungen].sort((a, b) => {
      const dateA = parseDate(a.dateTo || a.dateFrom)
      const dateB = parseDate(b.dateTo || b.dateFrom)
      return dateB - dateA
    })
  })

  const sortedKurse = computed(() => {
    return [...props.kurse].sort((a, b) => {
      const dateA = parseDate(a.datum)
      const dateB = parseDate(b.datum)
      return dateB - dateA
    })
  })

  const sortedAuszeichnungen = computed(() => {
    return [...props.auszeichnungen].sort((a, b) => {
      const dateA = parseDate(a.datum)
      const dateB = parseDate(b.datum)
      return dateB - dateA
    })
  })

  // Prüfungen ob Sektionen Inhalte haben
  const hasAnyAusbildung = computed(() => {
    return props.ausbildungen.some(
      (item: DynamicItem) =>
        item.title || item.subtitle || item.dateFrom || item.dateTo || item.description,
    )
  })

  const hasAnyBerufserfahrung = computed(() => {
    return props.berufserfahrungen.some(
      (item: DynamicItem) =>
        item.title || item.subtitle || item.dateFrom || item.dateTo || item.description,
    )
  })

  const hasAnyKurs = computed(() => {
    return props.kurse.some((item: KursItem) => item.title || item.anbieter || item.datum)
  })

  const hasAnyAuszeichnung = computed(() => {
    return props.auszeichnungen.some(
      (item: AuszeichnungItem) => item.title || item.verliehen || item.datum,
    )
  })

  const hasAnySprache = computed(() => {
    return props.sprachen.length > 0 && props.sprachen.some((item: SprachItem) => item.sprache)
  })

  return {
    // Funktionen
    parseDate,
    getLevelValue,

    // Computed Properties
    geburtsText,
    kenntnisseArray,
    interessenArray,
    sortedAusbildungen,
    sortedBerufserfahrungen,
    sortedKurse,
    sortedAuszeichnungen,
    hasAnyAusbildung,
    hasAnyBerufserfahrung,
    hasAnyKurs,
    hasAnyAuszeichnung,
    hasAnySprache,
  }
}
