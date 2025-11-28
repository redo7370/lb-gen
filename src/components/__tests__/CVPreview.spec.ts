import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import CVPreview from '../CVPreview.vue'
import type { CVProps } from '@/composables/useCVData'

describe('CVPreview - Dark Mode Props Tests', () => {
  let wrapper: VueWrapper
  const mockProps: CVProps = {
    personalData: {
      name: 'Test User',
      geburtsdatum: '1990-01-01',
      geburtsort: 'Berlin',
      adresse: 'Test Str. 1',
      telefon: '+49 123 456789',
      email: 'test@example.com',
      photoUrl: '',
    },
    ausbildungen: [],
    berufserfahrungen: [],
    kurse: [],
    auszeichnungen: [],
    kenntnisse: '',
    sprachen: [],
    interessen: '',
    isDarkMode: false,
    isSPADarkMode: false,
  }

  describe('Props Acceptance', () => {
    it('should accept isDarkMode prop for CV template', () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: true,
        },
      })

      expect((wrapper.vm.$props as CVProps).isDarkMode).toBe(true)
    })

    it('should accept isSPADarkMode prop for zoom controls', () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isSPADarkMode: true,
        },
      })

      expect((wrapper.vm.$props as CVProps).isSPADarkMode).toBe(true)
    })

    it('should work with isSPADarkMode undefined (optional prop)', () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isSPADarkMode: undefined,
        },
      })

      expect((wrapper.vm.$props as CVProps).isSPADarkMode).toBeUndefined()
    })
  })

  describe('CV Template Dark Mode (isDarkMode)', () => {
    it('should NOT apply dark-mode class when isDarkMode is false', () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: false,
        },
      })

      const cvPreview = wrapper.find('.cv-preview')
      expect(cvPreview.classes()).not.toContain('dark-mode')
    })

    it('should apply dark-mode class when isDarkMode is true', () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: true,
        },
      })

      const cvPreview = wrapper.find('.cv-preview')
      expect(cvPreview.classes()).toContain('dark-mode')
    })

    it('should update dark-mode class when isDarkMode prop changes', async () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: false,
        },
      })

      const cvPreview = wrapper.find('.cv-preview')
      expect(cvPreview.classes()).not.toContain('dark-mode')

      // Update prop
      await wrapper.setProps({ isDarkMode: true })
      expect(cvPreview.classes()).toContain('dark-mode')

      // Update prop again
      await wrapper.setProps({ isDarkMode: false })
      expect(cvPreview.classes()).not.toContain('dark-mode')
    })

    it('should display correct icon based on isDarkMode in theme button', async () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: false,
        },
      })

      const themeButton = wrapper.find('.theme-btn')

      // Should show moon icon when light mode (isDarkMode = false)
      expect(themeButton.text()).toContain('🌙')

      // Change to dark mode
      await wrapper.setProps({ isDarkMode: true })

      // Should show sun icon when dark mode (isDarkMode = true)
      expect(themeButton.text()).toContain('☀️')
    })
  })

  describe('Zoom Controls Dark Mode (isSPADarkMode)', () => {
    it('should NOT apply dark class to zoom controls when isSPADarkMode is false', () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isSPADarkMode: false,
        },
      })

      const zoomControls = wrapper.find('.zoom-controls')
      expect(zoomControls.classes()).not.toContain('dark')
    })

    it('should apply dark class to zoom controls when isSPADarkMode is true', () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isSPADarkMode: true,
        },
      })

      const zoomControls = wrapper.find('.zoom-controls')
      expect(zoomControls.classes()).toContain('dark')
    })

    it('should update zoom controls dark class when isSPADarkMode prop changes', async () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isSPADarkMode: false,
        },
      })

      const zoomControls = wrapper.find('.zoom-controls')
      expect(zoomControls.classes()).not.toContain('dark')

      // Update prop
      await wrapper.setProps({ isSPADarkMode: true })
      expect(zoomControls.classes()).toContain('dark')

      // Update prop again
      await wrapper.setProps({ isSPADarkMode: false })
      expect(zoomControls.classes()).not.toContain('dark')
    })
  })

  describe('Independent Dark Mode States', () => {
    it('should handle different states for CV and zoom controls', async () => {
      // CV dark, controls light
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: true,
          isSPADarkMode: false,
        },
      })

      expect(wrapper.find('.cv-preview').classes()).toContain('dark-mode')
      expect(wrapper.find('.zoom-controls').classes()).not.toContain('dark')

      // CV light, controls dark
      await wrapper.setProps({
        isDarkMode: false,
        isSPADarkMode: true,
      })

      expect(wrapper.find('.cv-preview').classes()).not.toContain('dark-mode')
      expect(wrapper.find('.zoom-controls').classes()).toContain('dark')

      // Both dark
      await wrapper.setProps({
        isDarkMode: true,
        isSPADarkMode: true,
      })

      expect(wrapper.find('.cv-preview').classes()).toContain('dark-mode')
      expect(wrapper.find('.zoom-controls').classes()).toContain('dark')

      // Both light
      await wrapper.setProps({
        isDarkMode: false,
        isSPADarkMode: false,
      })

      expect(wrapper.find('.cv-preview').classes()).not.toContain('dark-mode')
      expect(wrapper.find('.zoom-controls').classes()).not.toContain('dark')
    })
  })

  describe('Theme Toggle Event', () => {
    beforeEach(() => {
      wrapper = mount(CVPreview, {
        props: mockProps,
      })
    })

    it('should emit toggle-theme event when theme button is clicked', async () => {
      const themeButton = wrapper.find('.theme-btn')

      await themeButton.trigger('click')

      expect(wrapper.emitted('toggle-theme')).toBeTruthy()
      expect(wrapper.emitted('toggle-theme')).toHaveLength(1)
    })

    it('should emit toggle-theme event multiple times on multiple clicks', async () => {
      const themeButton = wrapper.find('.theme-btn')

      await themeButton.trigger('click')
      await themeButton.trigger('click')
      await themeButton.trigger('click')

      expect(wrapper.emitted('toggle-theme')).toHaveLength(3)
    })

    it('should NOT change isDarkMode prop directly (controlled by parent)', async () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: false,
        },
      })

      const themeButton = wrapper.find('.theme-btn')
      await themeButton.trigger('click')

      // Prop should not change (parent controls it)
      expect((wrapper.vm.$props as CVProps).isDarkMode).toBe(false)
      // But event should be emitted
      expect(wrapper.emitted('toggle-theme')).toBeTruthy()
    })
  })

  describe('Props Reactivity', () => {
    it('should react to rapid prop changes', async () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: false,
          isSPADarkMode: false,
        },
      })

      // Rapidly change props
      await wrapper.setProps({ isDarkMode: true })
      await wrapper.setProps({ isSPADarkMode: true })
      await wrapper.setProps({ isDarkMode: false })
      await wrapper.setProps({ isDarkMode: true })
      await wrapper.setProps({ isSPADarkMode: false })

      // Final state should be correct
      expect(wrapper.find('.cv-preview').classes()).toContain('dark-mode')
      expect(wrapper.find('.zoom-controls').classes()).not.toContain('dark')
    })

    it('should not interfere when one prop changes while the other stays constant', async () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: true,
          isSPADarkMode: false,
        },
      })

      // Change only isSPADarkMode
      await wrapper.setProps({ isSPADarkMode: true })

      // isDarkMode should remain unchanged
      expect(wrapper.find('.cv-preview').classes()).toContain('dark-mode')
      expect(wrapper.find('.zoom-controls').classes()).toContain('dark')
    })
  })

  describe('Bug Regression Test - Original Dark Mode Bug', () => {
    it('should allow CV template dark mode to work after repeatedly toggling SPA dark mode', async () => {
      wrapper = mount(CVPreview, {
        props: {
          ...mockProps,
          isDarkMode: false, // CV template starts in light mode
          isSPADarkMode: false, // SPA starts in light mode
        },
      })

      // Initial state
      expect(wrapper.find('.cv-preview').classes()).not.toContain('dark-mode')
      expect(wrapper.find('.zoom-controls').classes()).not.toContain('dark')

      // Toggle SPA dark mode multiple times (simulating navbar button clicks)
      await wrapper.setProps({ isSPADarkMode: true }) // SPA dark ON
      expect(wrapper.find('.zoom-controls').classes()).toContain('dark')

      await wrapper.setProps({ isSPADarkMode: false }) // SPA dark OFF
      expect(wrapper.find('.zoom-controls').classes()).not.toContain('dark')

      await wrapper.setProps({ isSPADarkMode: true }) // SPA dark ON
      expect(wrapper.find('.zoom-controls').classes()).toContain('dark')

      await wrapper.setProps({ isSPADarkMode: false }) // SPA dark OFF
      expect(wrapper.find('.zoom-controls').classes()).not.toContain('dark')

      await wrapper.setProps({ isSPADarkMode: true }) // SPA dark ON
      expect(wrapper.find('.zoom-controls').classes()).toContain('dark')

      // CV template should still be in light mode (unaffected by SPA toggles)
      expect(wrapper.find('.cv-preview').classes()).not.toContain('dark-mode')

      // Now toggle CV template to dark mode (simulating theme button click)
      await wrapper.setProps({ isDarkMode: true })
      expect(wrapper.find('.cv-preview').classes()).toContain('dark-mode')

      // CV template dark mode should work correctly
      const cvPreview = wrapper.find('.cv-preview')
      expect(cvPreview.classes()).toContain('dark-mode')

      // Toggle CV template back to light mode
      await wrapper.setProps({ isDarkMode: false })
      expect(cvPreview.classes()).not.toContain('dark-mode')

      // Toggle CV template to dark mode again
      await wrapper.setProps({ isDarkMode: true })
      expect(cvPreview.classes()).toContain('dark-mode')

      // SPA dark mode should still be active and independent
      expect(wrapper.find('.zoom-controls').classes()).toContain('dark')
    })
  })
})
