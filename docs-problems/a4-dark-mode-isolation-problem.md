# A4 Dark Mode Isolation Problem

## Problem Beschreibung

**Kernproblem:** Der Dark Mode des A4-Templates (Lebenslauf-Vorschau) ließ sich nicht mehr umschalten, wenn die SPA (Single Page Application) im Dark Mode war.

### Symptome

- Wenn Navbar-Button aktiviert war (SPA Dark Mode), konnte der Template-Button das A4-Sheet nicht mehr zwischen Hell und Dunkel wechseln
- Das A4-Template blieb im Dark Mode "stecken", sobald die SPA dunkel war
- State-Änderungen in Vue waren korrekt (Console-Logs zeigten richtige Werte), aber das DOM wurde visuell nicht aktualisiert

### Ursprüngliche Architektur

```
CVGen.vue
├── isSPADarkMode (Navbar Button)
├── isDarkMode (Template Button)
└── CVPreview.vue
    └── Inline A4 HTML mit gemischten Dark Mode States
```

**Hauptproblem:** Beide Dark Modes waren in derselben Component vermischt, was zu CSS-Konflikten und Reaktivitätsproblemen führte.

## Fehlgeschlagene Lösungsansätze

### Versuch 1: Props Synchronization

- **Ansatz:** Lokale refs in CVPreview mit Watch auf Props
- **Problem:** Props-Änderungen wurden nicht richtig an Child-Elemente weitergegeben

### Versuch 2: Inline Styles mit !important

- **Ansatz:** Direkte Style-Bindings mit `:style` und `!important` in CSS
- **Problem:** CSS-Vererbung von Parent-Komponenten überschrieb trotzdem die Styles

### Versuch 3: Force Re-render

- **Ansatz:** `:key` Attribut + `watch` mit `nextTick`
- **Problem:** State änderte sich korrekt, aber DOM-Update wurde blockiert

### Warum alles scheiterte

- **CSS Inheritance:** Parent `.dark-mode` Klassen beeinflussten Child-Elemente
- **Reaktivitäts-Grenze:** Computed properties über Component-Grenzen funktionierten nicht zuverlässig
- **State Management:** Zwei Dark Modes in einer Component führte zu Race Conditions

## Erfolgreiche Lösung: Complete Architectural Rewrite

### Schritt 1: Variable Umbenennung

```typescript
// useCVData.ts
interface CVProps {
  isSPADark?: boolean // SPA dark mode - nur für Zoom Controls
  isA4Dark?: boolean // A4 template dark mode - intern verwaltet
}
```

### Schritt 2: Component Extraction

Neue `CVA4Template.vue` Component erstellt:

```vue
<script setup lang="ts">
// Props - KEINE isSPADark accepted!
const props = defineProps<Omit<CVProps, 'isSPADark'>>()

// Internal A4 dark mode state - COMPLETELY ISOLATED
const isA4Dark = ref(false)

// Toggle handler
const toggleA4Dark = () => {
  isA4Dark.value = !isA4Dark.value
  localStorage.setItem('cv-a4-dark-mode', String(isA4Dark.value))
  emit('darkModeChange', isA4Dark.value)
}

// Expose für Parent
defineExpose({ toggleA4Dark, isA4Dark })
</script>
```

**Kritische Design-Entscheidungen:**

- `Omit<CVProps, 'isSPADark'>` verhindert, dass SPA Dark Mode jemals übergeben wird
- `defineExpose` ermöglicht Parent-Zugriff ohne Props
- Eigener localStorage Key: `cv-a4-dark-mode`

### Schritt 3: Event-basierte Kommunikation

```vue
// CVPreview.vue
const a4TemplateRef = ref<InstanceType<typeof CVA4Template> | null>(null)
const a4DarkMode = ref(false)

const handleToggleA4Theme = () => {
  if (a4TemplateRef.value) {
    a4TemplateRef.value.toggleA4Dark()
  }
}

const handleA4DarkModeChange = (value: boolean) => {
  a4DarkMode.value = value
}
```

```vue
<!-- Template -->
<CVA4Template
  ref="a4TemplateRef"
  @dark-mode-change="handleA4DarkModeChange"
  :personal-data="personalData"
  ...
/>
```

### Schritt 4: CSS Isolation - Durchbruch

**Problem identifiziert:** CSS-Selektoren waren nicht spezifisch genug!

#### Vorher (FALSCH):

```css
.cv-a4-template {
  background: white;
  color: #000;
}

.dark-mode .cv-sidebar {
  /* ❌ Kann von außen überschrieben werden! */
  background: #1e293b;
}
```

#### Nachher (KORREKT):

```css
.cv-a4-template {
  background: white !important;
  color: #000 !important;
  isolation: isolate;  /* ✅ CSS Isolation */
}

.cv-a4-template.dark-mode {
  background: #1a1a1a !important;
  color: #e0e0e0 !important;
}

.cv-a4-template.dark-mode .cv-sidebar {  /* ✅ Vollständig isoliert! */
  background: #1e293b;
}

/* ALLE Selektoren mit .cv-a4-template präfixiert */
.cv-a4-template .cv-header { ... }
.cv-a4-template .sidebar-section h2 { ... }
.cv-a4-template.dark-mode .main-section h2 { ... }
```

**Der entscheidende Unterschied:**

- Alle CSS-Selektoren beginnen mit `.cv-a4-template`
- `.dark-mode` wird immer als `.cv-a4-template.dark-mode` geschrieben
- `!important` auf Root-Level Background/Color
- `isolation: isolate` CSS-Property für zusätzliche Isolation
- `scoped` Styles in Vue garantieren keine Parent-Interference

## Finale Architektur

```
CVGen.vue (isSPADark only)
  ↓ passes isSPADark
CVPreview.vue (Zoom Controls + Event Handler)
  ↓ NO dark mode props
  ↓ template ref + events
CVA4Template.vue (internal isA4Dark)
  ↓ emits darkModeChange events
  ↓ completely isolated CSS
```

### Separation of Concerns

1. **CVGen:** Verwaltet nur SPA Dark Mode (Navbar Button)
2. **CVPreview:** Container mit Zoom Controls, kein Dark Mode State
3. **CVA4Template:** Eigener Dark Mode State, komplett isoliert

### LocalStorage Keys

- `cv-spa-dark-mode`: SPA Dark Mode
- `cv-a4-dark-mode`: A4 Template Dark Mode

## Lessons Learned

### 1. CSS Specificity ist kritisch

Generic `.dark-mode` Selektoren sind gefährlich in verschachtelten Components. Immer vollständig qualifizierte Selektoren verwenden!

### 2. Props vs. Events vs. Expose

- **Props:** Für initiale Daten (aber nicht für geteilte States!)
- **Events:** Für State-Änderungen nach oben kommunizieren
- **Expose:** Für Parent-Zugriff auf Child-Methoden

### 3. Complete Separation > Incremental Fixes

Manchmal ist ein kompletter Rewrite besser als viele kleine Patches. Die ursprüngliche Architektur war fundamental fehlerhaft.

### 4. localStorage Persistierung muss überall sein

Beide Components müssen beim Mount ihren State laden:

```typescript
onMounted(() => {
  const saved = localStorage.getItem('cv-a4-dark-mode')
  if (saved !== null) {
    isA4Dark.value = saved === 'true'
  }
})
```

### 5. Debugging mit Console Logs

State-Änderungen loggen half zu verstehen, dass das Problem NICHT in der Reaktivität lag, sondern im CSS!

## Resultat

✅ **A4 Template Dark Mode funktioniert komplett unabhängig vom SPA Dark Mode**  
✅ **Beide Modes werden persistent in localStorage gespeichert**  
✅ **Klare Trennung der Verantwortlichkeiten**  
✅ **CSS ist vollständig isoliert und kann nicht von außen beeinflusst werden**  
✅ **Event-basierte Kommunikation funktioniert reaktiv**

---

**Datum:** 28. November 2025  
**Gelöst durch:** Complete Architectural Rewrite + CSS Isolation mit spezifischen Selektoren
