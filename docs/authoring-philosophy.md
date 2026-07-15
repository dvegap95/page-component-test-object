# Authoring philosophy (maintainers & doc writers)

**Audience:** people writing or editing PCO documentation, examples, and demos — not required reading for library consumers.

Consumer-facing docs should reflect these constraints **implicitly** (wording, example shape) without turning this page into prescriptive rules for test object design. PCO users own their architecture.

---

## Modals and overlay test objects

A **modal test object describes an already-open overlay** — scoped queries and interactions inside that dialog (title, accept/cancel, fields).

- It typically **does not** open itself. Opening is an **external view action** (click Add → modal appears).
- Do **not** imply in examples that `confirmAdditionModal.acceptButton.userClick()` also opens the modal, unless the example explicitly shows the open step first.
- Multi-step flows that belong in one spec line may live as **view intents** (`await view.confirmAddition()`) — that is consumer choice, not a framework requirement.
- A modal TO does not need to know its **anchor** (what button opened it). Scope is the dialog role/label once visible.

**Doc examples — safe pattern:**

```ts
await view.addItemButton.userClick(); // opens modal — view action
await view.confirmAdditionModal.acceptButton.userClick(); // scoped inside open dialog
```

---

## When to escalate the “duplicate Accept button” story

Do **not** lead with nested `within()` as the everyday problem.

| Context | Reality |
|---------|---------|
| Isolated widget / shallow test | Often one dialog, one accessible Accept — `getByRole('button', { name: 'Accept' })` is enough |
| Full integration view | Competing buttons, cards, hidden regions — **then** ambiguous global queries hurt |

Build the narrative: simple case works → integration surface grows → scoped test objects avoid collision. The `within(dialog, …)` pattern is an **escalation**, not proof that every test needs PCO.

---

## User-centric vs component-centric interactions

Testing Library promotes **user-centric** APIs (`userEvent.click(element)`). PCO exposes both:

| Style | API | Status |
|-------|-----|--------|
| Component-centric | `await target.userClick()` | Supported; common in PCO examples |
| User-centric | `await view.getUser().click(target)` | Supported |

**Documentation stance:** do **not** argue against Testing Library’s user-centric model in public docs. Examples may use `userClick()` on PCO targets without claiming it is universally superior.

**Active user model:** one **shared `UserAgent` singleton** per app under test — the person at the keyboard right now. The agent is **exchangeable** (swap implementation per adapter) but PCO does **not** target multiple simultaneous users in one flow (see design-principles non-goals). Analog: one person in the chair, not ten people taking turns on the mouse.

Details: [design-principles.md](./design-principles.md#element-centric-interactions), [philosophy.md](./philosophy.md).

---

## Widget test objects vs view intents

- **Shared widget TO** (calendar, modal, select preset): reused via getters across views — `view.calendar`, `view.confirmAdditionModal`.
- **View intent**: composes steps the spec should not spell out — optional, consumer-owned.

Do not document widget TOs as responsible for unrelated view navigation unless the example shows that explicitly.

---

## Cypress query policy (document accurately)

In the Cypress adapter, `getBy*`, `queryBy*`, and `findBy*` on `context` **all enqueue** through `@testing-library/cypress` retry-aware commands (implementation maps them to the same chain). Do not document “use `findBy` in Cypress, not `getBy`” as a PCO rule.

Getters should return **PCO targets** (chainable), not materialized `HTMLElement`s passed to `cy.wrap()`.

---

## What not to put in consumer landing docs

Keep README / vision / getting-started free of:

- Mandates on mockData vs renderData wiring
- “Enforce child TOs” or anti-bloat lectures
- Explicit superiority claims for `userClick` vs `getUser().click`
- Implied modal self-open behavior
- Leading with `within()` before the integration escalation story

This file is the reference when those topics would otherwise leak into marketing copy.
