# Vue Form Technical Test

A dynamic form built with Vue 3, TypeScript, and Tailwind CSS v4. Features client-side validation, progressive disclosure, and internationalisation supporting English, French, and Italian.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 24.0.0
- npm >= 11

## Getting Started

```bash
# Clone the repository
git clone https://github.com/DanielCouzens/vue-form-technical-test.git
cd vue-form-technical-test

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Script                       | Description                             |
| ---------------------------- | --------------------------------------- |
| `npm run dev`                | Start the Vite development server       |
| `npm run build`              | Type-check and build for production     |
| `npm run preview`            | Preview the production build            |
| `npm run test:unit`          | Run unit tests with Vitest (watch mode) |
| `npm run test:unit -- --run` | Run unit tests once                     |
| `npm run lint`               | Run Oxlint and ESLint with auto-fix     |
| `npm run format`             | Format source files with Prettier       |
| `npm run type-check`         | Run TypeScript type checking            |

## Tech Stack

| Technology                                                | Version | Purpose                                          |
| --------------------------------------------------------- | ------- | ------------------------------------------------ |
| [Vue 3](https://vuejs.org/)                               | 3.5     | UI framework (Composition API, `<script setup>`) |
| [TypeScript](https://www.typescriptlang.org/)             | 6.0     | Type safety                                      |
| [Vite](https://vite.dev/)                                 | 8.0     | Build tool and dev server                        |
| [Tailwind CSS](https://tailwindcss.com/)                  | 4.3     | Utility-first styling                            |
| [vue-i18n](https://vue-i18n.intlify.dev/)                 | 11.4    | Internationalisation (EN, FR, IT)                |
| [Vitest](https://vitest.dev/)                             | 4.1     | Unit and component testing                       |
| [Vue Test Utils](https://test-utils.vuejs.org/)           | 2.4     | Vue component test utilities                     |
| [ESLint](https://eslint.org/)                             | 10.2    | Linting (flat config)                            |
| [Oxlint](https://oxc.rs/)                                 | 1.60    | Fast Rust-based linter                           |
| [Prettier](https://prettier.io/)                          | 3.8     | Code formatting                                  |
| [Husky](https://typicode.github.io/husky/)                | 9.1     | Git hooks                                        |
| [lint-staged](https://github.com/lint-staged/lint-staged) | 17.0    | Pre-commit linting on staged files               |

## Project Structure

```
src/
├── assets/
│   └── main.css              # Tailwind CSS entry point
├── components/
│   ├── CheckboxInput.vue      # Checkbox with boolean v-model
│   ├── CheckboxInput.spec.ts
│   ├── DateInput.vue          # Date picker with max-date constraint
│   ├── DateInput.spec.ts
│   ├── LanguageSwitcher.vue   # EN / FR / IT locale toggle
│   ├── LanguageSwitcher.spec.ts
│   ├── PasswordInput.vue      # Password with show/hide toggle
│   ├── PasswordInput.spec.ts
│   ├── SelectInput.vue        # Dropdown with optional placeholder
│   ├── SelectInput.spec.ts
│   ├── ServiceForm.vue        # Main form with progressive disclosure
│   ├── ServiceForm.spec.ts
│   ├── TextInput.vue          # Text/email input with type prop
│   └── TextInput.spec.ts
├── composables/
│   ├── useFormValidation.ts   # Validation logic and orchestration
│   └── useFormValidation.spec.ts
├── locales/
│   ├── en.json                # English translations
│   ├── fr.json                # French translations
│   └── it.json                # Italian translations
├── types/
│   └── index.ts               # Shared TypeScript types
├── test-utils.ts              # Test helper (i18n plugin factory)
├── App.vue                    # Root component
└── main.ts                    # App entry point with i18n setup
```

## Features

- **Progressive disclosure** — the "Other service" field appears only when relevant, using `v-if` with a smooth `<Transition>`
- **Client-side validation** — custom `useFormValidation` composable with per-field blur validation and full form validation on submit
- **Internationalisation** — all visible strings driven by vue-i18n with three locales (English, French, Italian)
- **Accessible** — labels linked to inputs, `aria-invalid`, `aria-describedby`, `role="alert"` on errors, full keyboard navigation, WCAG AA contrast
- **Tested** — 93 unit and component tests covering validation rules, component behaviour, progressive disclosure, and locale switching

## CI

Lint, type-check, unit tests, and build run on every push and pull request to `main` via GitHub Actions. Branch protection requires CI to pass before merging.

## Documentation

See [APPROACH.md](./APPROACH.md) for technical decisions, trade-offs, and architecture rationale.
