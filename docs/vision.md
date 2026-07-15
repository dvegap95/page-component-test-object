# Vision

PCO exists so **behavioral integration tests read like scenarios** — Given a user on the booking page, When they pick a date and book, Then the system confirms — without DOM archaeology, fixture leakage, or reimplemented server logic in every spec.

This page walks one flow end to end: the verbose way teams usually write it, the PCO-shaped version, then **what each piece buys you**.

---

## Scenario

```gherkin
Given a fixated date
And a user "John Doe" logged in on the booking page
And an available slot for next day at a specific hour
When the user selects that date and clicks Book
Then the date is booked in the system
When the booking is confirmed
Then the user gets a booked confirmation modal
```

The test should express that story. The setup and query mechanics should not compete with it.

---

## Without PCO — what the spec becomes

A declarative scenario still needs concrete data. Common approaches run into the same walls:

| Approach | Problem |
|----------|---------|
| Shared base fixture, tweak fields per test | Future tests inherit fields they never asked for — **fixture leakage** |
| Spread-copy the fixture each time | Nested properties (`user.profile.settings…`) force deep spreads or inline blobs |
| Inline a fully typed user | TypeScript wants every required field — most of them **irrelevant to the scenario** |

The booking page also depends on **surrounding state**: a table of days with free slots. Skip that mock and the view is loading-blocked or the scenario is inaccurate. So the spec grows:

1. Build a verbose user object (only `name` matters for the assertion).
2. Mock `GET /me` — MSW or otherwise.
3. Build a typed grid of days/slots; mock `GET /dates`.
4. Locate the target day — `screen`, global `queryByRole`, or `within(calendar)…` — **different styles across teams**.
5. If the picker hides behind a select: open select → find calendar portal → click day — fine for **calendar widget tests**, noise for a **booking flow test**.
6. Mock `POST /book` with a fixed response; click Book.
7. Assert POST body via spy argument tricks.
8. Query the confirmation modal — often **yet another inline selector style**.

The spec ends up longer than the feature behavior it describes. Worse: step 4 and 8 **duplicate knowledge** that will drift when markup changes.

---

## With PCO — the same scenario

PCO does not prescribe **where** scenario data lives — that is your view test object design. Some teams keep `mockData` and `renderData` aligned; others split them deliberately to surface errors. The toolset wires whatever you connect in `setupMockData()` and `render()`.

**Example A — scenario fields on the view:**

```ts
const view = new BookingViewTestObject();

view.targetUser = new UserFactory().setProps({ name: 'John Doe' }).build();
view.days = DateSlotFactory.gridFromModel([
  [null, null, null],
  [null, { free: true }, null],
  [null, null, null],
]);

await view.render();
// …
```

**Example B — register handlers before render:**

```ts
const view = new BookingViewTestObject();

view.userApi.registerGetMe(() => new UserFactory().setProps({ name: 'John Doe' }).build());
view.datesApi.registerGetDates(() => DateSlotFactory.listFromModel(model));
await view.render();
// …
```

Both are valid. The act/assert phase is the same:

```ts
const targetDate = view.days[1].dates[1];

await view.calendar.selectDate(targetDate);

const [bookSpy, resolveBook] = view.bookingApi.registerTriggeredRestHandler('post', '*/api/book');
await view.bookButton.userClick();

expect(bookSpy).toHaveBeenLastCalledWith(/* body containing user + date — see matchers */);

await resolveBook({ status: 201, body: { id: 'booking-1' } });

expect(view.confirmedBookingModal.root).toBeVisible();
expect(view.confirmedBookingModal.ownerName).toBe('John Doe');
expect(view.confirmedBookingModal.date).toBe(targetDate);
```

`view.calendar` and `view.confirmedBookingModal` are **shared widget test objects** — the same `BookingCalendarTestObject` (or preset) every booking-related view exposes via a getter. That reuse is the main shift from classic Page Objects, where calendar logic gets reimplemented per page.

**Interactions on PCO targets:** examples use `await view.bookButton.userClick()`. `view.getUser().click(target)` remains supported — see [authoring philosophy](./authoring-philosophy.md) (maintainers).

During the in-flight request you can assert loading state on the same surface:

```ts
await view.bookButton.userClick();
expect(view.bookButton).toHaveAttribute('aria-busy', 'true'); // or a domain matcher when you add one
await resolveBook({ status: 201, body: { id: 'booking-1' } });
```

`registerTriggeredRestHandler` lets the POST **hang until you resolve it** — test loading UI and confirmation in one spec without a real server or request-dependent handler logic.

---

## What each layer removes

| Pain in the verbose spec | PCO mechanism | What stays in the spec |
|--------------------------|---------------|-------------------------|
| Inline user with 20 irrelevant fields | `UserFactory().setProps({ name })` | The one field the scenario names |
| Ad hoc mock + render assembly | `setupMockData()` + `render()` — you wire the connection | Overrides only for this case |
| `within` chains / mixed query styles | Shared widget TO via getter — `view.calendar.selectDate()` | The date you care about |
| Global vs scoped query drift | TestObject owns scope (dialog, calendar, modal) | Intent methods |
| Interaction on queried target | PCO targets expose `userClick()` / `userType()`; `getUser()` also available | Act on the element the scenario names |
| POST assert via spy internals | `registerTriggeredRestHandler` + [matchers](./matchers.md) | Request contract + UI outcome |
| Inline modal queries | Shared modal TO via getter — `view.confirmedBookingModal.*` | Assertions on owner, date, visibility |
| Copy-paste setup in Storybook/Cypress | Same `__pco__` surface via adapters ([resolver model](./resolver-model.md)) | Same intents, runner-native execution |

---

## Design goals (summary)

1. **Scenario-first specs** — setup expresses Given; acts express When; expects express Then.
2. **Default state you define** — `view.render()` with your mockset and harness; override only what the scenario needs.
3. **Scenario-focused data** — factories and handlers scoped to the test case; no shared fixture leakage.
4. **Scoped query ownership** — widgets and modals expose getters and intents; specs do not guess which "Accept" button wins.
5. **Shared widget test objects** — the same calendar/modal TO across views via getters, not reimplemented per screen.
6. **Elements are test objects** — queried items support `userClick()` / `userType()` directly.
7. **HTTP boundary without fake servers** — MSW handlers + spies; optional triggered responses for async UX. See [HTTP boundary](./http-boundary.md).
8. **One contract, many runners** — active direction for `0.2.x`: one TestObject definition consumed by Vitest, Storybook, and Cypress through the resolver model. Partial today; see [cross-runner tutorial](./cross-runner-tutorial.md) and [Cypress adoption](./cypress-adoption.md).

---

## What is shipped vs what you compose

| In the booking example | Status in `0.1.x` |
|------------------------|-------------------|
| `DataFactory` / `setProps` / `build` | **Shipped** — `@page-component-object/core` |
| `registerRestHandler` + spy matchers | **Shipped** — `@page-component-object/msw`, [matchers](./matchers.md) |
| `registerTriggeredRestHandler` | **Shipped** — `@page-component-object/msw` |
| `view.render()` + `setupMockData()` | **Shipped** — `@page-component-object/react` |
| PCO targets from `getByRole` / `getAllByRole` | **Shipped** — `@page-component-object/queries` |
| `calendar.selectDate`, `confirmedBookingModal` | **Your** view / preset intents — e.g. compose `@page-component-object/preset-mui` |
| `toBeLoading()`, `toBeBookedFor()` | **Optional** — domain matchers you add via semantic-matchers or `expect` on getters |

The booking flow is **representative** — illustrative pseudocode, not a bundled demo. Smaller runnable slices live in `apps/*` today; a dedicated booking walkthrough app may follow when the author exercises the toolset in depth.

---

## Next steps

- [Getting started](./getting-started.md) — wire your first view test object
- [Project structure](./project-structure.md) — `__pco__`, factories, `*Api.to.ts`
- [HTTP boundary](./http-boundary.md) — mock response vs assert request
- [Why PCO](./why-pco.md) — duplication diagram, layer model
