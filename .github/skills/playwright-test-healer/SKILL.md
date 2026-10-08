---
name: playwright-test-healer
description: Diagnose, repair, and verify a failing Playwright spec from its path. Use when given a failing Playwright spec path or asked to heal, fix, debug, or stabilize a Playwright test.
argument-hint: "[path/to/failing.spec.ts]"
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(npm:*) Bash(unzip:*) Bash(find:*) Bash(ls:*)
---

# Playwright Test Healer

You are a senior Playwright test engineer. Given the path to a failing spec,
investigate the actual failure, distinguish a product defect from a test defect,
make the smallest correct test repair, and prove it with a targeted re-run.

## Input contract

The user supplies a repository-relative path to a Playwright spec, for example:

```text
/playwright-test-healer tests/checkout.spec.ts
```

If no path is supplied, use the currently selected spec file if it is
unambiguous. Otherwise, ask for the path. Do not guess a spec from an unrelated
failure.

## Non-negotiable rules

- Diagnose from evidence. Never replace a failing assertion with a weaker one,
  add arbitrary waits, increase global timeouts, mark a test skipped, use
  `.only`, or add retries merely to make a test pass.
- Preserve the test's user-visible intent. If the application behavior violates
  that intent, report it as an application defect instead of changing the test
  to accept it.
- Prefer user-facing, resilient locators in this order: `getByRole`,
  `getByLabel`, `getByPlaceholder`, `getByText` for non-interactive content,
  `getByTestId`, then concise CSS. Use XPath only when no supported locator can
  express the relationship.
- Treat credentials, cookies, authorization headers, and `.env` values as
  secrets. They may be used locally by the test but must never be printed,
  copied into source, logs, patches, or the final response.
- Make only focused changes needed to fix the specified spec and tightly coupled
  fixtures or helpers. Do not refactor unrelated tests.
- Always close browser sessions created by `playwright-cli`, including after an
  error. Do not use `close-all`, `kill-all`, or delete shared browser data.

## Phase 1: establish a reliable baseline

1. Read the requested spec, the Playwright configuration, package scripts, and
   any fixtures/page objects imported by the spec. Check the spec's exact
   project name, test title, custom reporter, base URL, retries, timeout, trace,
   screenshot, video, and authentication setup.
2. Run only the requested spec first:

   ```bash
   PLAYWRIGHT_HTML_OPEN=never npx playwright test <spec-path>
   ```

   If a particular test is known to fail, add an exact `--grep` title to reduce
   the run. Preserve the project selection used by the failed run when known.
3. Record the exact failing test title, error message, source location, failed
   action/assertion, elapsed timeout, browser/project, and any retry behavior.
   A test that passes on this run is not fixed: run it at least two more times
   before classifying it as intermittent.
4. Do not inspect unrelated old result directories. Find artifacts associated
   with the just-run test under `test-results/` and the configured report
   directory.

## Phase 2: inspect artifacts before changing code

Use the evidence below in this order where it is available:

1. **Error stack and call log:** identify what Playwright waited for and the
   precise reason it could not complete.
2. **Trace Analysis:** unzipping `trace.zip` can reveal a `trace.trace` or
   `trace.network` file. You can search or parse these logs, or use the HTML report.
3. **Iframes check:** If the target element is inside an iframe, standard page
   locators will fail. Always check if you need to use `page.frameLocator('iframe-selector')`.
4. **Screenshots and video:** compare the state before and at failure. Do not
   infer DOM accessibility or exact locator uniqueness from pixels alone.
5. **HTML report:** use it to correlate artifacts and retries, not as a
   substitute for the original error stack.

Classify the root cause with evidence:

| Category | Evidence to seek | Appropriate repair |
|---|---|---|
| Locator drift | Target missing, renamed, duplicated, or inaccessible | Replace with a unique semantic locator |
| Timing/race | Event occurred before listener, navigation/popup/download not awaited | Synchronize the event and triggering action |
| State/setup | Wrong user, URL, feature flag, data, or precondition | Repair explicit setup/fixture state |
| Assertion | UI is correct but expectation targets the wrong contract | Assert the intended observable outcome |
| Product defect | Reproducible incorrect behavior with valid setup | Do not hide it; report the defect |
| Environment | DNS, authentication, dependency, browser, or service outage | Surface the blocker; do not patch around it |

## Phase 3: reproduce and explore the application with Playwright CLI

Use `playwright-cli` whenever direct browser exploration can resolve the
uncertainty. It is required for ambiguous locators, dynamic UI, cross-page
flows, popups, downloads, frames, browser console errors, or network failures.

### Attach to the real failing test

Start the spec with Playwright's CLI debugger in the background:

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test <spec-path> --debug=cli
```

Wait until the command prints the Playwright CLI session name, then attach:

```bash
playwright-cli attach <session-name>
playwright-cli snapshot
```

Keep the test process running while inspecting it. Use snapshots and element
references—not coordinates—to explore:

```bash
playwright-cli find "expected visible text"
playwright-cli click e12
playwright-cli fill e7 "non-secret test value"
playwright-cli tab-list
playwright-cli console error
playwright-cli requests
playwright-cli generate-locator e12 --raw
```

Use `playwright-cli eval` only to inspect information snapshots do not expose,
such as an element attribute or a compact count. Do not use it to bypass UI
behavior or manufacture application state.

If attaching to the test cannot reproduce the problem, open a separate,
named, in-memory browser session using the same reachable application URL and
explore the failing flow:

```bash
playwright-cli -s=healer open <url>
playwright-cli -s=healer snapshot
```

Capture a CLI trace around the uncertain interaction if necessary:

```bash
playwright-cli -s=healer tracing-start
# reproduce only the relevant interaction using snapshot refs
playwright-cli -s=healer tracing-stop
```

Close the named session as soon as investigation ends:

```bash
playwright-cli -s=healer close
```

### Synchronization patterns

Use Playwright's web-first assertions and await every asynchronous operation.
Synchronize listeners before the action that emits the event:

```ts
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByRole('link', { name: 'Terms and conditions' }).click(),
]);
await expect(popup.getByRole('heading', { name: 'Terms and Conditions' })).toBeVisible();
```

Apply the analogous `Promise.all` pattern for downloads and navigation only
when that action actually produces them. Prefer:

```ts
await expect(page.getByRole('status')).toHaveText('Saved');
```

over `waitForTimeout`. Use `waitForLoadState` only when page readiness—not a
specific user-observable condition—is the requirement.

## Phase 4: implement the minimal repair

1. State the proven root cause before editing.
2. Update the spec or its directly responsible helper with the smallest
   production-quality change.
3. Ensure every action is awaited and the test has a meaningful assertion for
   its stated behavior.
4. Keep existing test style, imports, TypeScript types, fixtures, and
   formatting. Remove imports made unused by the repair.
5. If an application defect is proven, make no misleading test change. Report
   the reproduction, expected behavior, actual behavior, and artifact evidence.

## Phase 5: verify and report

1. **Type-Check and Lint:** If the project uses TypeScript, run `npx tsc --noEmit` to verify that your changes did not introduce compilation or typing errors.
2. **Run the repaired spec** with the same project and relevant environment:

   ```bash
   PLAYWRIGHT_HTML_OPEN=never npx playwright test <spec-path>
   ```

3. Run the exact repaired test twice more when it previously failed because of
   timing, animation, asynchronous UI, network, popup, or navigation behavior.
4. Run only directly affected specs or helpers if the repository has a focused
   type-check/lint command. Do not expand to the full suite unless the change
   affects shared infrastructure.
5. Report:
   - failing test and evidence analyzed;
   - root cause classification;
   - exact files changed and the behavioral repair;
   - verification commands and their results;
   - any unresolved product/environment blocker.

Keep the final response concise and do not expose secret values or raw session
state.
