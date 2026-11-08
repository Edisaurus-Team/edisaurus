# Refactor Plan: React-driven content edits in Article.jsx

## Goal

Replace direct DOM mutation (`document.querySelector`, `replaceChild`, `remove()`, etc.) with
React state as the single source of truth for the diff markup, so that accept/reject/undo/final-text
all derive from data instead of from reading-and-rewriting the live DOM.

## 1. New data model

Replace the single `content` HTML string with a parsed array of **segments**:

```js
// static text/markup that is never edited
{ type: 'static', id: 's0', html: '<br><br>Some unchanged text ' }

// a reviewable change - either side may be null, but not both
{
  type: 'change',
  id: 'c0',
  del: '<del-inner-html or null>',
  ins: '<ins-inner-html or null>',
  status: 'pending' | 'accepted' | 'rejected',
}
```

State:
- `segments` — the array above, built once when the article loads.
- `selectedChangeId` — replaces `selectedNode`; just the `id` of the selected change segment (or `null`).
- `undoStack` — array of `{ id, previousStatus }` (see §5).
- `view` — unchanged.

`finalEdit` as a piece of state goes away; it becomes a derived value (see §6).

## 2. Parsing the server HTML into segments

`data.htmlChanges` is a flat run of sibling nodes (text, `<br>`, `<del>`, `<ins>`) — there's no
nesting to worry about structurally. Parse it once, in the fetch effect, with `DOMParser`:

```js
function parseMarkupToSegments(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const nodes = Array.from(doc.body.firstChild.childNodes)
  const segments = []
  let staticBuffer = ''
  let changeCounter = 0
  let staticCounter = 0

  function flushStatic() {
    if (staticBuffer) {
      segments.push({ type: 'static', id: `s${staticCounter++}`, html: staticBuffer })
      staticBuffer = ''
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.nodeName === 'DEL') {
      const next = nodes[i + 1]
      flushStatic()
      if (next && next.nodeName === 'INS') {
        segments.push({ type: 'change', id: `c${changeCounter++}`,
          del: node.innerHTML, ins: next.innerHTML, status: 'pending' })
        i++ // consumed the INS too
      } else {
        segments.push({ type: 'change', id: `c${changeCounter++}`,
          del: node.innerHTML, ins: null, status: 'pending' })
      }
    } else if (node.nodeName === 'INS') {
      // a standalone insertion (no preceding DEL)
      flushStatic()
      segments.push({ type: 'change', id: `c${changeCounter++}`,
        del: null, ins: node.innerHTML, status: 'pending' })
    } else {
      // text node, <br>, or anything else diff-match-patch emits -> accumulate as-is
      staticBuffer += (node.nodeType === Node.TEXT_NODE ? node.textContent : node.outerHTML)
    }
  }
  flushStatic()
  return segments
}
```

This runs once per fetch (`useEffect` on `id`), not on every render, so the one-time DOM-parsing
cost is fine. IDs are stable for the component's lifetime because `segments` is only ever updated
by mapping over itself (never re-parsed or reordered), which also makes them safe React `key`s.

## 3. Rendering

Replace `<p dangerouslySetInnerHTML={{__html: content}}>` with a map over `segments`:

```jsx
<p className="markupDisplay">
  {segments.map(seg =>
    seg.type === 'static'
      ? <span key={seg.id} dangerouslySetInnerHTML={{ __html: seg.html }} />
      : <Change key={seg.id} seg={seg} isSelected={seg.id === selectedChangeId}
          onSelect={selectChange} registerRef={registerChangeRef} />
  )}
</p>
```

`Change` is a small presentational component that switches on `status`:

```jsx
function Change({ seg, isSelected, onSelect, registerRef }) {
  const ref = useRef(null)
  useEffect(() => { registerRef(seg.id, ref.current) }, [seg.id])

  if (seg.status === 'accepted') {
    return seg.ins ? <span ref={ref} dangerouslySetInnerHTML={{ __html: seg.ins }} /> : null
  }
  if (seg.status === 'rejected') {
    return seg.del ? <span ref={ref} dangerouslySetInnerHTML={{ __html: seg.del }} /> : null
  }
  // pending
  return (
    <span ref={ref}>
      {seg.del && <del className={isSelected ? 'del-selected' : ''}
        onClick={() => onSelect(seg.id)} dangerouslySetInnerHTML={{ __html: seg.del }} />}
      {seg.ins && <ins className={isSelected ? 'ins-selected' : ''}
        onClick={() => onSelect(seg.id)} dangerouslySetInnerHTML={{ __html: seg.ins }} />}
    </span>
  )
}
```

This is the part that removes almost all DOM-querying: selection highlighting is a className driven
by `isSelected`, not a manually-toggled `.className` property.

## 4. Selection

```js
function selectChange(id) {
  setSelectedChangeId(id)
}
```

No more pairing-up logic in `selectNode` — the del/ins pairing already happened once, at parse
time, in `parseMarkupToSegments`. Clicking either side of a change just selects its segment id.

## 5. Accept / reject / undo as state transitions

```js
function setStatus(id, status) {
  setSegments(prev => prev.map(s => (s.id === id ? { ...s, status } : s)))
}

function accept() {
  if (!selectedChangeId) return
  setUndoStack(stack => [...stack, { id: selectedChangeId, previousStatus: 'pending' }])
  setStatus(selectedChangeId, 'accepted')
  setSelectedChangeId(null)
}

function reject() {
  if (!selectedChangeId) return
  setUndoStack(stack => [...stack, { id: selectedChangeId, previousStatus: 'pending' }])
  setStatus(selectedChangeId, 'rejected')
  setSelectedChangeId(null)
}

function undo() {
  setUndoStack(stack => {
    if (stack.length === 0) return stack
    const last = stack[stack.length - 1]
    setStatus(last.id, last.previousStatus)
    return stack.slice(0, -1)
  })
}

function acceptRemaining() {
  // matches current behavior: bulk action, not added to the undo stack
  setSegments(prev => prev.map(s =>
    s.type === 'change' && s.status === 'pending' ? { ...s, status: 'accepted' } : s))
}
```

This is a direct simplification of today's `undoStack` (which stores live DOM node references and
an `anchor` sibling to splice them back into the right place). Since status is just data, "undo" is
just "set status back to what it was" — no DOM splicing, no anchor bookkeeping. Note `previousStatus`
is always `'pending'` under the current accept/reject flow (a segment can only transition pending →
accepted/rejected once, since selecting an already-decided change isn't exposed in the UI), but
storing it explicitly costs nothing and keeps undo correct if that ever changes (e.g. if "re-review
a decided change" is added later).

## 6. Next / previous change navigation

```js
function changeList() {
  return segments.filter(s => s.type === 'change')
}

function nextChange() {
  const list = changeList()
  const idx = list.findIndex(s => s.id === selectedChangeId)
  const next = list[(idx + 1) % list.length] // wraps; current code doesn't wrap, see note below
  selectChange(next.id)
  changeRefs.current[next.id]?.scrollIntoView({ block: 'center', inline: 'nearest' })
}
```

`previousChange` is symmetric. `changeRefs` is a `useRef({})` map populated by each `Change`'s
`registerRef(id, node)` callback (see §3) — this is the one place we still need a real DOM node
reference, but only to call `scrollIntoView`, never to read or mutate its content.

Note: the current implementation's next/previous logic walks `nextElementSibling` and stops at
whatever `DEL`/`INS` is next, with no wraparound (`change.nextElementSibling` can be `null` and
throw at the end of the document). Worth deciding during the refactor whether to keep that
limitation or fix it to wrap — flagging it here rather than silently changing behavior.

## 7. Final Edit / Side-by-Side views become derived, not imperative

Today, clicking the "Final Edit" or "Side-by-Side" tab calls `setFinalEdit(processFinalText())`
inside the click handler — a side effect tied to a button click rather than to the data it depends
on. With segments as state, this becomes a plain derived value:

```js
const finalEditHtml = useMemo(() => {
  return segments.map(seg => {
    if (seg.type === 'static') return seg.html
    // pending changes preview as if accepted, matching current behavior
    return (seg.status === 'rejected') ? '' : (seg.ins || '')
  }).join('')
}, [segments])
```

No `useEffect`, no event-driven `setFinalEdit` — `view` just decides whether to render it, and it's
always current.

## 8. Saving

`saveChanges` currently re-derives two cleaned-up HTML blobs from the live `.markupDisplay` DOM and
reads `.innerText` off temporary containers. With segments as the source of truth, the two text
variants are built directly from data:

```js
function buildText(segments, sideForPending) {
  // sideForPending: 'del' for the "original" doc, 'ins' for the "edited" doc
  return segments.map(seg => {
    if (seg.type === 'static') return seg.html
    if (seg.status === 'accepted') return seg.ins || ''
    if (seg.status === 'rejected') return seg.del || ''
    return seg[sideForPending] || '' // still pending: show del for original, ins for edited
  }).join('')
}
```

This reproduces the existing semantics exactly: decided changes (accepted/rejected) contribute the
same content to both the "original" and "edited" text (the decision is final), while pending
changes still show their del-side in the original text and their ins-side in the edited text — so
that re-running the server's diff against the saved pair regenerates the same pending change.

The one DOM touchpoint that's legitimately hard to avoid is converting that HTML into plain text
(`<br>` → newline, whitespace collapsing) the same way `.innerText` does. Keep a small utility for
*only* that conversion, not for traversal or mutation:

```js
function htmlToInnerText(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  document.body.appendChild(div) // innerText needs layout; see note below
  const text = div.innerText
  document.body.removeChild(div)
  return text
}
```

(`innerText` depends on rendered layout, so the element needs to be attached to the document,
ideally off-screen (`position:absolute; visibility:hidden`) — this is worth double-checking against
the current behavior, since today's version reads `.innerText` from a detached node, which in some
browsers falls back to `textContent`-like behavior. Worth verifying the two approaches agree on the
`<br>`-heavy content this app deals with, or switching to an explicit HTML→text conversion that
doesn't depend on layout at all.)

## 9. Popup positioning (Accept/Reject buttons)

The floating `nodePanel` currently reads `selectedNode.del.offsetTop/offsetLeft`. With `changeRefs`
(§6) already mapping `id → DOM node`, this becomes:

```js
const node = changeRefs.current[selectedChangeId]
const top = node ? node.offsetTop + 25 : 0
const left = node ? node.offsetLeft : 0
```

Read inside a `useLayoutEffect` keyed on `selectedChangeId` (to avoid a one-frame flash at the wrong
position), stored in a small `popupPos` state.

## 10. Click handling cleanup

The single `handleDocumentClick` dispatching on `event.target.id`/`nodeName` can be split into real
`onClick` handlers per button (`onClick={() => setView('markup')}`, etc.), since segment selection
no longer depends on bubbling up to a container listener. Keep one narrow "click outside a change
deselects" handler on the content area, scoped to clicks that aren't on a `<del>`/`<ins>`.

## 11. Suggested migration order

1. Add `parseMarkupToSegments` and switch the fetch effect to populate `segments` instead of
   `content`, while leaving rendering/handlers untouched temporarily (render `segments` back into
   one HTML string to sanity-check the parser against today's visual output).
2. Swap the markup `<p dangerouslySetInnerHTML>` for the `segments.map` + `Change` rendering in §3.
3. Replace `selectNode`/`selectedNode` with `selectedChangeId` and update the popup positioning.
4. Replace `accept`/`reject`/`undo`/`acceptRemaining` with the state-transition versions in §5.
5. Replace `nextChange`/`previousChange` with the array-based versions in §6, wiring up `changeRefs`.
6. Replace the imperative `setFinalEdit(processFinalText())` calls with the derived `finalEditHtml`
   in §7, and delete `processFinalText`.
7. Replace `saveChanges`'s DOM-querying with `buildText` in §8.
8. Delete now-unused DOM-mutation helpers and the catch-all `handleDocumentClick`.

Each step keeps the component working end-to-end, so this can land as incremental PRs/commits
rather than one large rewrite.

## 12. Edge cases to verify against the current behavior before/after

- A `DEL` with no following `INS` (pure deletion suggestion) and an `INS` with no preceding `DEL`
  (pure insertion suggestion) — both exist in `nextChange`'s current traversal logic and must parse
  into single-sided `change` segments correctly.
- Whitespace-only or empty static runs between changes (e.g. two adjacent changes with nothing
  between them) — `flushStatic` should simply not push an empty segment.
- Whatever inline tags diff-match-patch nests *inside* a `<del>`/`<ins>` (if any) should survive
  being captured as `innerHTML` strings and re-rendered via `dangerouslySetInnerHTML` unchanged.
- `acceptRemaining` intentionally bypasses the undo stack today — decide whether to preserve that
  limitation (simplest, matches current behavior) or extend undo to cover bulk actions.


CHANGES MADE:
Let me verify it compiles. First checking where the build writes.

  Read 1 file, ran 1 shell command

Build compiles cleanly. Now let me verify the parsing logic against real diff output from the database.

  Made 1 scratchpad edit +20, ran 4 shell commands

No DOM in Node, so I'll install jsdom into the scratchpad (not the project) to exercise the real logic headlessly against that data.

  Made 2 scratchpad edits +182, ran 2 shell commands

Pure logic verified against real data. Now let me exercise the actual React component headlessly — first checking what WorkshopTable fetches, since Article renders it.

  Read 1 file

Now a headless interaction test of the real component, bundled with the project's own webpack/babel setup.

  Made 3 scratchpad edits +264, ran 2 shell commands

Babel resolves presets relative to the source file; I'll pin them to absolute paths.

  Made 1 scratchpad edit +7 -6, ran 2 shell commands

First 10 checks pass. The failure is my harness — the undo button has no id when active (pre-existing: id is only set to undo-inactive). Selecting it by label instead.

  Made 1 scratchpad edit +4 -2, ran 2 shell commands

All checks pass except the clipboard one — that's Node 26's own read-only global navigator shadowing jsdom's. Fixing the harness.
