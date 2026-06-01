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

`aria-invalid` is always rendered explicitly — as either `"true"` or `"false"` — rather
than being omitted when there is no error. This is more reliable for screen readers, which
handle the explicit `false` value more consistently than a missing attribute.

### Attribute passthrough on SelectInput

`SelectInput` uses `v-bind="$attrs"` on the `<select>` element combined with
`defineOptions({ inheritAttrs: false })`. This prevents Vue from attaching inherited
attributes to the root `<div>` and instead forwards them directly to the `<select>`.

This allows callers to pass native attributes such as `name`, `required`, `disabled`, or
`autocomplete` without the component needing to explicitly define them as props — making
the component more flexible without increasing its API surface.

### Placeholder as a prop on SelectInput

The SelectInput `placeholder` prop is optional. When provided, a disabled option with an
empty value is rendered as the first option, making the unselected state explicit to the
user. When omitted, no placeholder is rendered and the first real option is shown by
default.

This matters because a `<select>` with no placeholder and `modelValue: ''` will visually
display the first option even though it has not been chosen — which can silently submit
the wrong value. The placeholder makes the required selection explicit.

---

## Progressive Disclosure

Progressive disclosure is the pattern of showing form fields only when they become
relevant, rather than presenting everything at once. In this form, the "Please specify"
text field is hidden until the user selects "Other" from the service dropdown.

### Why v-if and not v-show

Vue offers two ways to conditionally render elements:

- `v-show` toggles `display: none` — the element remains in the DOM
- `v-if` removes the element from the DOM entirely

For a conditionally required field, `v-if` is the correct choice for two reasons:

1. A `v-show` field that is hidden is still present in the DOM and could be submitted
   with an empty value, requiring extra logic to skip its validation. A `v-if` field
   that is absent simply does not exist — no validation needed, no accidental submission.
2. It is semantically clearer — the field does not exist until it is needed.

### Transition

The conditionally rendered field is wrapped in Vue's `<Transition>` component with
Tailwind CSS opacity classes. This animates the field fading in when inserted and fading
out when removed, avoiding an abrupt visual snap that would feel jarring to the user.

---

### Validation

Validation was implemented from scratch rather than using a library such as **Zod** combined with **Vee-Validate** (or similar solutions like Vuelidate).

This decision involved a deliberate tension between two competing priorities:

- **Scalability and maintainability**: In a larger application with many forms or complex rules, I would use Zod for schema definition because it offers declarative, type-safe validation, excellent developer experience, and powerful features like conditional validation (`.refine()` / `.superRefine()`), transformation, and async validation.
- **Demonstrating core competencies**: The brief made it clear that reviewers wanted to see how I handle form validation logic. Using a library would have hidden much of this logic behind abstractions. By writing it manually, I could clearly demonstrate:
  - Reactive error state management
  - Conditional field validation (`otherService` only when `service === 'other'`)
  - Field-level validation on blur + full form validation on submit
  - Clean TypeScript integration

The implementation was deliberately structured in a clear, extensible way so that migrating to Zod later would be straightforward. For this technical test, showing the actual validation logic took precedence over using a production-grade library.

### Implementation Details

Validation rules are defined using a `ValidatorMap` — a typed object where each key maps
to a validator function for that field. This is more scalable than a switch statement:
adding a new field requires only one new entry in the map.

Each validator is a pure function that receives the field value (and optionally the full
form state for conditional rules) and returns either an empty string (valid) or an error
message.

### Email validation

Email validation uses a regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) rather than the browser’s
native `checkValidity()` method. The DOM approach (`document.createElement(‘input’)`) was
trialled but reverted for two reasons:

1. It does not flag empty strings as invalid in the absence of a `required` attribute,
   requiring an additional guard that the regex handles implicitly.
2. It couples the validator to the DOM, which would break in an SSR or Node.js context.

No client-side email validation is a guarantee of deliverability — the only true
validation is sending a verification email. The regex is a UX aid that catches obvious
formatting errors before submission.

### Defence in depth on DateInput

The `DateInput` component sets a `max` attribute equal to today’s date. This prevents
the browser’s native date picker from allowing future dates to be selected. This does
not replace the validator — the composable still validates that the date is in the
past — but it improves UX by preventing the error before it occurs.

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

### Consistent accessibility assertions

All field component tests assert both the error-present and error-absent states for
`aria-invalid` and `aria-describedby`. This consistency was established after the
`SelectInput` assessment identified that earlier components only tested the error-present
path — a gap that was retroactively corrected across all components.

### Testing form submission in Vue Test Utils

A key finding during development: triggering a submit button's click event via
`wrapper.find('[data-testid="submit-button"]').trigger('click')` does not reliably
fire the form's `@submit.prevent` handler in jsdom. The reliable approach is to trigger
the submit event directly on the form element:

```typescript
await wrapper.find('form').trigger('submit')
```

Similarly, setValue on native inputs inside child components does not always propagate
back up through the v-model chain to the parent's reactive state. Emitting directly
on the component instance is more reliable for setting parent form state in integration
tests:

```typescript
await wrapper.findComponent({ name: 'TextInput' }).vm.$emit('update:modelValue', 'Dan')
```
