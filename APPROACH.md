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

## Validation

Validation was implemented from scratch rather than using a library such as **Zod** combined with **Vee-Validate** (or similar solutions like Vuelidate).

This decision involved a deliberate tension between two competing priorities:

- **Scalability and maintainability**: In a larger application with many forms or complex rules, I would use Zod for schema definition because it offers declarative, type-safe validation, excellent developer experience, and powerful features like conditional validation (`.refine()` / `.superRefine()`), transformation, and async validation.
- **Demonstrating core competencies**: The brief made it clear that reviewers wanted to see how I handle form validation logic. Using a library would have hidden much of this logic behind abstractions. By writing it manually, I could clearly demonstrate:
  - Reactive error state management
  - Conditional field validation (`otherService` only when `service === 'other'`)
  - Field-level validation on blur + full form validation on submit
  - Clean TypeScript integration

The implementation was deliberately structured in a clear, extensible way so that migrating to Zod later would be straightforward. For this technical test, showing the actual validation logic took precedence over using a production-grade library.

### useFormValidation composable

Validation logic lives in a standalone `useFormValidation` composable rather than inline
in `ServiceForm.vue`. The composable accepts the reactive form object and returns
`errors`, `validateField`, and `validateAll`. This separation means:

- The validation rules are independently testable in isolation from the component
- `ServiceForm.vue` is concerned only with rendering and user interaction
- The composable could be reused across multiple forms with different field sets

### ValidatorMap pattern

Validation rules are defined using a `ValidatorMap` — a typed object where each key maps
to a validator function for that field. This is more scalable than a switch statement:
adding a new field requires only one new entry in the map rather than a new case block.

Each validator is a pure function that receives the field value (and optionally the full
form state for conditional rules) and returns either an empty string (valid) or an error
message string (invalid).

### validateAll and the every() short-circuit

An initial implementation of `validateAll` used `Array.every()`. During the TDD process
the test asserting that all error messages appear simultaneously on a failed submit
failed immediately — revealing that `every()` short-circuits on the first `false`,
meaning subsequent fields were never validated.

The implementation was updated to separate the validation pass from the result check:

```typescript
// Correct: map runs all validators first, then check results
const results = (Object.keys(form) as Array<keyof ServiceFormData>).map((field) =>
  validateField(field),
)
return results.every(Boolean)
```

This is a good example of TDD surfacing a subtle behavioural issue at the test-writing
stage rather than during manual testing or in production.
