# Technical Approach & Architectural Decisions

This document explains the technical decisions made during development, the trade-offs considered, and what would be done differently at production scale. It is intended to be read alongside the code.

---

## Development Methodology

### AI-Assisted Development

This project was developed using AI tooling throughout, as requested in the brief. The primary tools were:

- **Claude** (Anthropic) — architecture planning, design direction, code review, and documentation
- **Claude Code** — implementation, refactoring, and test writing within VS Code
- **Matt Pocock's "Improve Codebase Architecture" skill** — used via Claude Code to produce a formal architecture review of the completed codebase, identifying four refactoring candidates ranked by leverage
- **A custom component assessment skill** — written for Claude Code to evaluate each component against accessibility, TypeScript, and testing standards as it was built

The AI tools were directed and reviewed at every step. The git history, PR descriptions, and this document reflect the decision-making process.

### TDD

All components and composables were built using Test-Driven Development — tests written first, implementation second. This approach was chosen because:

- It forces the API of each component to be designed before implementation, leading to cleaner interfaces
- It ensures every feature has test coverage by definition
- The failing tests act as a specification, making the intent of each piece of code clear

The project ends with 93 unit and component tests across 8 test files.

### Project Management

The project was managed using GitHub Issues and a kanban project board, with one branch per issue and conventional commits (e.g. `feat(VFT-003):`, `refactor:`, `docs:`) throughout. CI runs lint, type-check, unit tests, and build on every push and pull request. Branch protection on `main` requires CI to pass before merging.

This reflects how the work would be approached in a production team environment.

---

## Scalability

The brief asked for solutions that are clean, efficient, and scalable. Several architectural decisions were made with scalability specifically in mind:

- **Consistent component contract** — every field component follows the same props/emits interface (`modelValue`, `label`, `error`, `update:modelValue`). Adding a new field type means creating one component that follows this contract — no changes to the form or validation infrastructure.
- **ValidatorMap** — adding a new validation rule is one entry in the map. The composable does not need to be restructured to accommodate new fields.
- **Composable extraction** — validation logic lives in `useFormValidation`, not in the component. A second form with different fields could reuse the same composable pattern with a different set of validators.
- **i18n key structure** — locale files use a consistent nested structure (`form.fields.*`, `form.validation.*`). Adding a new field means adding keys to each locale file — no code changes to the i18n setup.
- **Shared types** — `ServiceFormData` and `SelectOption` live in `src/types/index.ts`. As the application grows, this is the natural place for domain types used across multiple files.

---

## Vue 3 Composition API

All components use `<script setup>` with the Composition API. This is the current Vue 3 recommended approach and offers several advantages over the Options API:

- Better TypeScript inference — props and emits are typed directly with generics
- Composables replace mixins — logic is extracted into reusable functions without naming collisions
- Smaller bundle output — `<script setup>` components compile more efficiently

---

## Component Architecture

Each form field is a separate, reusable component rather than a single monolithic form. This makes each field independently testable, styleable, and easy to compose.

### Props and emits convention

All field components follow the same contract:

- `modelValue` + `update:modelValue` for `v-model` support
- `label` and optional `error` props

### TypeScript in components

All components use `lang="ts"` on the `<script setup>` block with typed props via `defineProps<{...}>()` and typed emits via `defineEmits<{...}>()`. Props are typed inline using generics rather than the runtime declaration syntax — the generic approach gives better TypeScript inference and removes the need for separate interface definitions for simple prop shapes.

### Accessible ID generation

Each component uses Vue 3's built-in `useId()` to generate a unique ID per instance. This ID links the `<label>` to the `<input>` via `for`/`id`, and links the error message to the input via `aria-describedby`.

An earlier approach derived the ID from the label text (`label.toLowerCase().replace(/\s+/g, '-')`), but this was replaced because two components with the same label would generate the same `id`, which is invalid HTML. `useId()` guarantees uniqueness regardless of label text.

### Accessibility pattern

Every field component implements the following accessibility pattern:

- `<label :for="inputId">` — associates the label with the input
- `:aria-invalid="!!error"` — signals to screen readers when a field is in an error state
- `:aria-describedby` — links the input to its error message when one is present
- `role="alert"` on the error span — causes screen readers to announce the error immediately

`aria-invalid` is always rendered explicitly — as either `"true"` or `"false"` — rather than being omitted when there is no error. This is more reliable for screen readers, which handle the explicit `false` value more consistently than a missing attribute.

The form was verified with axe DevTools (zero violations) and WAVE (zero contrast errors). Full keyboard navigation was confirmed: Tab, Shift+Tab, Enter, Space, and arrow keys all work as expected.

### Attribute passthrough

All field components use `v-bind="$attrs"` on the native input element combined with `defineOptions({ inheritAttrs: false })`. This prevents Vue from attaching inherited attributes to the wrapper `<div>` and instead forwards them directly to the input.

This pattern was essential for wiring up blur validation — without it, `@blur` handlers in ServiceForm were silently landing on the wrapper div instead of the input element.

### TextInput type prop

`TextInput` accepts an optional `type` prop that defaults to `'text'`. This was the result of a refactoring exercise: `EmailInput` was originally a separate component but was identical to `TextInput` except for `type="email"`. It failed what the architecture review called the "deletion test" — deleting it and adding a single prop to TextInput produced the same result with less duplication.

---

## Progressive Disclosure

The "Please specify" field is shown only when "Other" is selected, using `v-if` with a `<Transition>` for smooth opacity animation.

`v-if` was chosen over `v-show` because the field is conditionally required — keeping it in the DOM (`v-show`) would require extra logic to skip validation on a hidden field and risk accidentally submitting empty values. With `v-if` the field simply does not exist until it is needed.

---

## Validation

### Why written from scratch

Validation was implemented from scratch rather than using a library such as **Zod** combined with **vee-validate**.

This decision involved a deliberate tension between two competing priorities:

- **Scalability and maintainability**: In a larger application with many forms or complex rules, I would use Zod for schema definition because it offers declarative, type-safe validation, excellent developer experience, and powerful features like conditional validation (`.refine()` / `.superRefine()`), transformation, and async validation.
- **Demonstrating core competencies**: The brief asked reviewers to evaluate form creation, validation logic, and Vue.js best practices. Using a library would have hidden much of this logic behind abstractions. By writing it from scratch, the submission demonstrates reactive error state management, conditional field validation, field-level and form-level validation, and clean TypeScript integration.

In a production application, the `ValidatorMap` would likely be replaced by a Zod schema. Simple field validators would migrate mechanically; cross-field rules like `otherService` would need restructuring to use Zod's `.superRefine()`.

### useFormValidation composable

Validation logic lives in a standalone `useFormValidation` composable. The composable accepts the reactive form object and a `t` translation function, and returns:

- `errors` — reactive object with an error string per field
- `onBlur(field)` — validates a single field (used on blur)
- `onInput(field)` — re-validates only if an error already exists (used on input)
- `handleSubmit()` — validates all fields and returns a boolean

`validateField` and `validateAll` are private internals. ServiceForm binds the public handlers declaratively — no orchestration logic remains in the component.

The `t` function is passed in as a parameter rather than importing `useI18n()` inside the composable. This keeps the composable framework-agnostic — it doesn't depend on vue-i18n directly, making it easier to test (tests pass a simple lookup function) and theoretically reusable outside a Vue i18n context.

### validateAll and the every() short-circuit

An initial implementation of `validateAll` used `Array.every()`. During the TDD process the test asserting that all error messages appear simultaneously on a failed submit failed immediately — revealing that `every()` short-circuits on the first `false`, meaning subsequent fields were never validated.

The implementation was updated to separate the validation pass from the result check using `map` then `every(Boolean)`. This is a good example of TDD surfacing a subtle behavioural issue at the test-writing stage rather than during manual testing or in production.

### Inline error clearing

Errors appear on blur (not while the user is typing) but clear on input once the value becomes valid. The `onInput` handler only re-validates if an error already exists for that field — no validation runs on every keystroke when there is no error to clear.

### Email validation

Email validation uses a regex rather than the browser's native `checkValidity()` method. The DOM approach (`document.createElement('input')`) was trialled but reverted because it does not flag empty strings as invalid without a `required` attribute and couples the validator to the DOM, which would break in an SSR or Node.js context.

No client-side email validation is a guarantee of deliverability — the only true validation is sending a verification email. The regex is a UX aid that catches obvious formatting errors before submission.

### Defence in depth on DateInput

The `DateInput` component sets a `max` attribute equal to today's date. This prevents the browser's native date picker from allowing future dates to be selected. This does not replace the validator — the composable still validates that the date is in the past — but it improves UX by preventing the error before it occurs.

---

## Internationalisation

### Architecture

vue-i18n is configured in Composition API mode (`legacy: false`). Three locale files (EN, FR, IT) share a consistent key structure: `form.fields.*`, `form.placeholders.*`, `form.options.*`, `form.validation.*`, `form.submit`, `form.success`, and `form.title`.

The `serviceOptions` array in ServiceForm is a `computed` property rather than a static array. This ensures dropdown labels re-render immediately when the locale changes — a static array would display stale translations until the component re-mounted.

### Locale persistence

The selected locale is persisted to `localStorage` and read on app startup in `main.ts`. The document's `lang` attribute is updated reactively via a watcher in `App.vue` — in plain Vue 3 the `<html>` tag is outside Vue's scope, so `document.documentElement.setAttribute()` is the standard approach. In Nuxt this would be handled declaratively via `useHead()`.

### Test isolation

A `createTestI18n` helper in `src/test-utils.ts` creates a fresh i18n instance for each test that needs one. The composable tests use a simple key lookup function instead of the full i18n plugin, since the composable accepts any `(key: string) => string` function.

---

## Styling

The form uses **Tailwind CSS v4** with a clean, modern light theme inspired by the hosting.com aesthetic — teal accents, generous whitespace, subtle shadows, and clear focus states.

All responsive styles follow Tailwind's mobile-first convention: base styles target mobile, `sm:` and above override for larger screens. Custom design tokens are defined via `@theme` in the CSS file.

---

## Testing

### Colocated tests

Test files live alongside the files they test (`TextInput.spec.ts` next to `TextInput.vue`) rather than in a centralised `__tests__` directory. This is the modern Vue convention and makes it immediately visible which files have test coverage.

### Two-layer test strategy

- **Unit tests** on the `useFormValidation` composable — each validation rule tested in isolation with no DOM or component involvement. Fast, focused, easy to debug.
- **Integration tests** on `ServiceForm` — verify that errors appear in the UI, aria states update correctly, progressive disclosure works, and the composable is wired up correctly.

Both layers are necessary. A bug in how the composable is connected to the component would pass all unit tests but fail the integration tests.

### Testing form submission in Vue Test Utils

A key finding during development: triggering a submit button's click event via `trigger('click')` does not reliably fire the form's `@submit.prevent` handler in jsdom. The reliable approach is to trigger the submit event directly on the form element:

```typescript
await wrapper.find('form').trigger('submit')
```

Similarly, `setValue` on native inputs inside child components does not always propagate back up through the `v-model` chain to the parent's reactive state. Emitting directly on the component instance is more reliable for setting parent form state in integration tests:

```typescript
await wrapper.findComponent({ name: 'TextInput' }).vm.$emit('update:modelValue', 'Dan')
```

---

## What would be added with more time

### Architecture & maintainability

- **BaseField component** — the accessibility contract (`useId`, label, `aria-describedby`, `aria-invalid`, `role="alert"`) is duplicated across all field components. A slot-based `BaseField` would own this contract once — fixing an accessibility bug would require one edit instead of six.
- **useLocale composable** — `LanguageSwitcher` currently mutates i18n state and writes to `localStorage` directly. Extracting a `useLocale` composable would separate display from persistence.

### Additional testing

- E2E tests with Playwright covering the full form submission flow
- Storybook for isolated component development and visual documentation
- Visual regression tests

### UI enhancements

- Dark mode support with system preference detection and toggle
- `lucide-vue-next` icons for the password show/hide toggle
- Cross-browser date picker fallback for older Safari versions
- Form reset — a "submit another enquiry" path after successful submission
