import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import CVGen from '../CVGen.vue'

// Mock HTML2PDF
vi.mock('html2pdf.js', () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
  })),
}))

// Mock Child Components
vi.mock('../CVPreview.vue', () => ({
  default: {
    name: 'CVPreview',
    template: '<div class="cv-preview-mock"></div>',
    props: [
      'personalData',
      'ausbildungen',
      'berufserfahrungen',
      'kurse',
      'auszeichnungen',
      'kenntnisse',
      'sprachen',
      'interessen',
      'isDarkMode',
      'isSPADarkMode',
    ],
  },
}))

vi.mock('../CVPDFTemplate.vue', () => ({
  default: {
    name: 'CVPDFTemplate',
    template: '<div class="cv-pdf-template-mock"></div>',
    props: [
      'personalData',
      'ausbildungen',
      'berufserfahrungen',
      'kurse',
      'auszeichnungen',
      'kenntnisse',
      'sprachen',
      'interessen',
      'isDarkMode',
    ],
  },
}))

describe('CVGen - Dark Mode Tests', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with both dark modes disabled by default', () => {
      wrapper = mount(CVGen)

      // Check if container does NOT have dark-mode class (light mode by default)
      expect(wrapper.find('.container').classes()).not.toContain('dark-mode')
    })
  })

  describe('SPA Dark Mode Toggle (Navbar Button)', () => {
    beforeEach(() => {
      wrapper = mount(CVGen)
    })

    it('should toggle SPA dark mode when navbar button is clicked', async () => {
      const navbarButton = wrapper.find('.theme-toggle-btn')

      // Initially light mode is on (dark mode OFF)
      expect(wrapper.find('.container').classes()).not.toContain('dark-mode')

      // Click to turn on dark mode
      await navbarButton.trigger('click')
      expect(wrapper.find('.container').classes()).toContain('dark-mode')

      // Click to turn off dark mode
      await navbarButton.trigger('click')
      expect(wrapper.find('.container').classes()).not.toContain('dark-mode')
    })

    it('should pass isSPADarkMode prop correctly to CVPreview', async () => {
      const navbarButton = wrapper.find('.theme-toggle-btn')

      // Get initial prop value (should be false - light mode)
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })
      expect(cvPreview.props('isSPADarkMode')).toBe(false)

      // Toggle to dark mode
      await navbarButton.trigger('click')
      expect(cvPreview.props('isSPADarkMode')).toBe(true)
    })

    it('should NOT affect CV template dark mode when toggling SPA dark mode', async () => {
      const navbarButton = wrapper.find('.theme-toggle-btn')
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })

      const initialCVDarkMode = cvPreview.props('isDarkMode')

      // Toggle SPA dark mode
      await navbarButton.trigger('click')
      await navbarButton.trigger('click')
      await navbarButton.trigger('click')

      // CV dark mode should remain unchanged
      expect(cvPreview.props('isDarkMode')).toBe(initialCVDarkMode)
    })
  })

  describe('CV Template Dark Mode Toggle (Theme Button in Zoom Controls)', () => {
    beforeEach(() => {
      wrapper = mount(CVGen)
    })

    it('should pass correct isDarkMode prop to CVPreview', () => {
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })

      // Initially CV light mode is on (dark mode OFF)
      expect(cvPreview.props('isDarkMode')).toBe(false)
    })

    it('should toggle CV template dark mode when emitting toggle-theme event', async () => {
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })

      // Initially light mode is on
      expect(cvPreview.props('isDarkMode')).toBe(false)

      // Simulate theme toggle from CVPreview (turn on dark mode)
      await cvPreview.vm.$emit('toggle-theme')
      expect(cvPreview.props('isDarkMode')).toBe(true)

      // Toggle again (turn off dark mode)
      await cvPreview.vm.$emit('toggle-theme')
      expect(cvPreview.props('isDarkMode')).toBe(false)
    })

    it('should pass same isDarkMode to both CVPreview and CVPDFTemplate', async () => {
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })
      const cvPdfTemplate = wrapper.findComponent({ name: 'CVPDFTemplate' })

      expect(cvPreview.props('isDarkMode')).toBe(cvPdfTemplate.props('isDarkMode'))

      // Toggle
      await cvPreview.vm.$emit('toggle-theme')
      expect(cvPreview.props('isDarkMode')).toBe(cvPdfTemplate.props('isDarkMode'))
    })

    it('should NOT affect SPA dark mode when toggling CV template dark mode', async () => {
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })

      const initialSPADarkMode = wrapper.find('.container').classes().includes('dark-mode')

      // Toggle CV dark mode multiple times
      await cvPreview.vm.$emit('toggle-theme')
      await cvPreview.vm.$emit('toggle-theme')
      await cvPreview.vm.$emit('toggle-theme')

      // SPA dark mode should remain unchanged
      const currentSPADarkMode = wrapper.find('.container').classes().includes('dark-mode')
      expect(currentSPADarkMode).toBe(initialSPADarkMode)
    })
  })

  describe('Independent Dark Mode States', () => {
    beforeEach(() => {
      wrapper = mount(CVGen)
    })

    it('should maintain independent states for SPA and CV dark modes', async () => {
      const navbarButton = wrapper.find('.theme-toggle-btn')
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })

      // Initial: both dark modes OFF (light mode)
      expect(wrapper.find('.container').classes()).not.toContain('dark-mode') // SPA
      expect(cvPreview.props('isDarkMode')).toBe(false) // CV

      // Turn on SPA dark mode
      await navbarButton.trigger('click')
      expect(wrapper.find('.container').classes()).toContain('dark-mode')
      expect(cvPreview.props('isDarkMode')).toBe(false) // CV still OFF

      // Turn on CV dark mode
      await cvPreview.vm.$emit('toggle-theme')
      expect(wrapper.find('.container').classes()).toContain('dark-mode')
      expect(cvPreview.props('isDarkMode')).toBe(true) // Both ON

      // Turn off SPA dark mode
      await navbarButton.trigger('click')
      expect(wrapper.find('.container').classes()).not.toContain('dark-mode') // SPA OFF
      expect(cvPreview.props('isDarkMode')).toBe(true) // CV still ON

      // Turn off CV dark mode
      await cvPreview.vm.$emit('toggle-theme')
      expect(wrapper.find('.container').classes()).not.toContain('dark-mode') // Both OFF
      expect(cvPreview.props('isDarkMode')).toBe(false)
    })
  })

  describe('Props Propagation', () => {
    beforeEach(() => {
      wrapper = mount(CVGen)
    })

    it('should pass correct prop names to CVPreview', () => {
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })

      expect(cvPreview.props()).toHaveProperty('isDarkMode')
      expect(cvPreview.props()).toHaveProperty('isSPADarkMode')
    })

    it('should pass only isDarkMode to CVPDFTemplate', () => {
      const cvPdfTemplate = wrapper.findComponent({ name: 'CVPDFTemplate' })

      expect(cvPdfTemplate.props()).toHaveProperty('isDarkMode')
      expect(cvPdfTemplate.props()).not.toHaveProperty('isSPADarkMode')
    })

    it('should update props reactively when states change', async () => {
      const navbarButton = wrapper.find('.theme-toggle-btn')
      const cvPreview = wrapper.findComponent({ name: 'CVPreview' })

      // Change SPA dark mode (turn on)
      await navbarButton.trigger('click')
      expect(cvPreview.props('isSPADarkMode')).toBe(true)

      // Change CV dark mode (turn on)
      await cvPreview.vm.$emit('toggle-theme')
      expect(cvPreview.props('isDarkMode')).toBe(true)
    })
  })
})
