# Approach & Technical Decisions

This document explains the technical decisions made during development, the trade-offs
considered, and what would be added with more time. It is intended to be read alongside
the code.

---

## Project Management

This project was managed using GitHub Issues and a kanban project board, with one branch
per issue and conventional commits throughout. This reflects how the work would be
approached in a production team environment.

---

## Vue 3 Composition API

All components use `<script setup>` with the Composition API. This is the current Vue 3
recommended approach and offers several advantages over the Options API:

- Better TypeScript inference — props and emits are typed directly with generics
- Composables replace mixins — logic is extracted into reusable functions without the
  naming collision and implicit dependency problems of mixins
- Smaller bundle output — `<script setup>` components compile more efficiently

---

## Component Architecture

Each form field is a separate, reusable component rather than a single monolithic form.
This makes each field independently testable, independently styleable, and easy to
compose into different form layouts.

### Props and emits convention

All field components follow the same contract:

- Accept `modelValue` (the field value) and `label` (the visible label text)
- Accept an optional `error` prop for displaying validation messages
- Emit `update:modelValue` on input

This contract is what makes `v-model` work on each component. When a parent uses
`<TextInput v-model="name" />`, Vue is passing `modelValue` as a prop and listening
for `update:modelValue` — the tests verify this contract directly.

### TypeScript in components

All components use `lang="ts"` on the `<script setup>` block. This enables full
TypeScript support within the component, including typed props via `defineProps<{...}>()`
and typed emits via `defineEmits<{...}>()`.

Props are typed inline using generics rather than the runtime declaration syntax
(`defineProps({ label: String })`). The generic approach gives better TypeScript
inference and removes the need for a separate interface definition for simple prop
shapes.

### Accessible ID generation

Each component uses Vue 3's built-in `useId()` to generate a unique ID per instance.
This ID links the `<label>` to the `<input>` via `for`/`id`, and links the error message
to the input via `aria-describedby`.

An earlier approach derived the ID from the label text
(`label.toLowerCase().replace(/\s+/g, '-')`), but this was replaced because two
components with the same label would generate the same `id`, which is invalid HTML.
`useId()` guarantees uniqueness regardless of label text.

### Accessibility pattern

Every field component implements the following accessibility pattern:

- `<label :for="inputId">` — associates the label with the input
- `:aria-invalid="!!error"` — signals to screen readers when a field is in an error state
- `:aria-describedby` — links the input to its error message when one is present
- `role="alert"` on the error span — causes screen readers to announce the error immediately

---

## Validation

### Why written from scratch

A library such as vee-validate combined with a schema library like zod would be the
appropriate choice for a production application at scale — particularly for async
validation, complex cross-field rules, or a large number of fields.

For this submission, validation was written from scratch in a `useFormValidation`
composable for two reasons:

1. The validation requirements are straightforward enough that a library would add
   dependency overhead without meaningful benefit at this scale
2. Writing it from scratch keeps the logic transparent and demonstrates understanding
   of the underlying patterns — the composable is structured so that swapping in a
   schema library later would require minimal changes

The composable follows a rules-object pattern: one entry per field, each with a
`validate` function and an error message. This structure mirrors how schema libraries
work, making a future migration straightforward.

### Defence in depth on DateInput

The `DateInput` component sets a `max` attribute equal to today's date. This prevents
the browser's native date picker from allowing future dates to be selected. This does
not replace validation in `useFormValidation` — the composable still validates that
the date is in the past — but it improves UX by preventing the error before it occurs.

The `today` value is a plain `const` rather than a `computed` ref. Since a date of birth
field does not need to react to the date changing during a session, the extra reactivity
overhead of `computed` would be unnecessary.

---

## Testing

### TDD methodology

All components and composables were built using Test-Driven Development — tests written
first, implementation second. This approach was chosen because:

- It forces the API of each component to be designed before implementation, leading to
  cleaner interfaces
- It ensures every feature has test coverage by definition
- The failing tests act as a specification, making the intent of each piece of code clear

### Colocated tests

Test files live alongside the files they test (`TextInput.spec.ts` next to
`TextInput.vue`) rather than in a centralised `__tests__` directory. This is the
modern Vue convention and makes it immediately visible which files have test coverage.

### What the tests verify

Component tests verify behaviour, not implementation:

- The component renders the correct elements
- The `v-model` contract works (modelValue prop + update:modelValue emit)
- Error messages appear and are accessible when the error prop is set
- The label is correctly associated with the input

Tests avoid asserting specific generated ID values (e.g. `v-0`) and instead assert
the relationship — that the label's `for` matches the input's `id`. This makes tests
resilient to Vue's internal ID generation.

---

## What would be added with more time

- **E2E tests** using Playwright covering the full form submission flow
- **Storybook** for isolated component development and visual documentation
- **lucide-vue-next** icons for the password show/hide toggle
- **Cross-browser date picker** fallback for older Safari versions
- **Form state management** via Pinia for more complex form scenarios
