# lb-gen

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## New Features

### PDF Export Improvements
- Fixed an issue where content was rendered on the second page instead of the first.
- Ensured content is aligned to the top of the page in the PDF export.
- Sidebar and main content backgrounds now extend to the bottom of the A4 page.

### Overflow Detection and Warnings
- Added functionality to detect when content exceeds one page.
- Highlighted overflowing elements in red in the preview.
- Displayed a warning message to notify users about content overflow.

### How to Use
1. **Generate CV Preview**: Use the CV generator to create your CV and preview it in the application.
2. **Check for Overflow**: If your content exceeds one page, the overflowing elements will be highlighted in red, and a warning message will appear.
3. **Export to PDF**: Once the content fits within one page, click the export button to generate a PDF of your CV.

### Development Notes
- The `CVA4Template.vue` component includes the logic for overflow detection and emits an `overflow` event.
- The `CVPreview.vue` component forwards the `overflow` event to the `CVGen.vue` component.
- The `CVGen.vue` component handles the `overflow` event, displays the warning message, and manages the PDF export process.

### Testing
- Use `vue-tsc` to ensure all TypeScript files compile without errors.
- Test the application in the browser to verify the new features and ensure the PDF export works as expected.
