import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import WorkshopTable from './WorkshopTable'
import '../css/articleStyle.css'
import { FaRegCopy, FaRegSave } from "react-icons/fa";


// textContent gives back the unescaped characters, so re-escape to keep every segment's
// html string safe to re-render
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// create_html sends a flat run of <span>/<del>/<ins> siblings. A <del> immediately followed by
// an <ins> is one change with both sides; any other <del> or <ins> is a one-sided change.
function parseMarkupToSegments(html) {
  const doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html')
  const nodes = Array.from(doc.body.firstChild.childNodes)
  const segments = []
  let staticHtml = ''
  let staticCount = 0
  let changeCount = 0

  function flushStatic() {
    if (!staticHtml) return
    segments.push({ type: 'static', id: 's' + staticCount++, html: staticHtml })
    staticHtml = ''
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const isDel = node.nodeName === 'DEL'
    const isIns = node.nodeName === 'INS'
    if (!isDel && !isIns) {
      staticHtml += node.nodeType === Node.TEXT_NODE ? escapeHtml(node.textContent) : node.outerHTML
      continue
    }
    const paired = isDel && nodes[i + 1] && nodes[i + 1].nodeName === 'INS'
    flushStatic()
    segments.push({
      type: 'change',
      id: 'c' + changeCount++,
      del: isDel ? node.innerHTML : null,
      ins: isIns ? node.innerHTML : (paired ? nodes[i + 1].innerHTML : null),
      status: 'pending'
    })
    if (paired) i++
  }
  flushStatic()
  return segments
}

// sideForPending picks which side an undecided change contributes: 'ins' for the edited text,
// 'del' for the original text. Decided changes read the same either way.
function buildHtml(segments, sideForPending) {
  return segments.map(seg => {
    if (seg.type === 'static') return seg.html
    if (seg.status === 'accepted') return seg.ins || ''
    if (seg.status === 'rejected') return seg.del || ''
    return seg[sideForPending] || ''
  }).join('')
}

function htmlToText(html) {
  const container = document.createElement('div')
  container.innerHTML = html.replace(/<br\s*\/?>/gi, '\n')
  return container.textContent
}

function Change({ seg, isSelected, onSelect, registerRef }) {
  const setRef = useCallback(node => registerRef(seg.id, node), [registerRef, seg.id])

  if (seg.status === 'accepted') {
    return seg.ins ? <span dangerouslySetInnerHTML={{__html: seg.ins}}></span> : null
  }
  if (seg.status === 'rejected') {
    return seg.del ? <span dangerouslySetInnerHTML={{__html: seg.del}}></span> : null
  }

  function handleClick(event) {
    event.stopPropagation()
    onSelect(seg.id)
  }

  return (
    <>
      {seg.del &&
        <del ref={setRef} className={isSelected ? 'del-selected' : ''} onClick={handleClick}
          dangerouslySetInnerHTML={{__html: seg.del}}></del>}
      {seg.ins &&
        <ins ref={seg.del ? null : setRef} className={isSelected ? 'ins-selected' : ''} onClick={handleClick}
          dangerouslySetInnerHTML={{__html: seg.ins}}></ins>}
    </>
  )
}

export default function Article() {
  const { id } = useParams()
  const [segments, setSegments] = useState([])
  const [originalText, setOriginalText] = useState('')
  const [date, setDate] = useState()
  const [selectedChangeId, setSelectedChangeId] = useState(null)
  const [undoStack, setUndoStack] = useState([])
  const [view, setView] = useState('markup')
  const [popupPosition, setPopupPosition] = useState(null)

  //not sure if these need to be set in state, since they never change.
  //may want to have a separate fetch function.
  const [prompt, setPrompt] = useState()

  // id -> the rendered node of each pending change, used for scrolling and panel placement only
  const changeRefs = useRef({})
  const registerChangeRef = useCallback((changeId, node) => {
    if (node) changeRefs.current[changeId] = node
    else delete changeRefs.current[changeId]
  }, [])

  useEffect(() => {
      async function fetchData() {
          try {
              const response = await fetch('/api/get_article/' + id)
              const data = await response.json()

              // <br> tags are added into markup by diff-match-patch, but Original text just comes straight from what the user submitted
              // so we are adding them here. Probably need a more concise way of applying uniform formatting in server-side code.
              const ogText = data.originalText.replace(/\n/g, '<br><br>');
              setSegments(parseMarkupToSegments(data.htmlChanges || ''))
              setOriginalText(ogText)
              setDate(data.submitDate)
              setPrompt(data.customPrompt)
          } catch (error) {
              console.error('Error:', error)
          }
      }
      setSelectedChangeId(null)
      setUndoStack([])
      fetchData()
  }, [id])

  const pendingChanges = useMemo(
    () => segments.filter(seg => seg.type === 'change' && seg.status === 'pending'),
    [segments]
  )

  const finalEditHtml = useMemo(() => buildHtml(segments, 'ins'), [segments])

  useLayoutEffect(() => {
    const node = selectedChangeId ? changeRefs.current[selectedChangeId] : null
    setPopupPosition(node ? { top: node.offsetTop + 25, left: node.offsetLeft } : null)
  }, [selectedChangeId, view])

  function setChangeStatus(changeId, status) {
    setSegments(current => current.map(seg => seg.id === changeId ? { ...seg, status } : seg))
  }

  function decide(status) {
    if (!selectedChangeId) return
    setUndoStack(current => [...current, { id: selectedChangeId, previousStatus: 'pending' }])
    setChangeStatus(selectedChangeId, status)
    setSelectedChangeId(null)
  }

  function undo() {
    const undoItem = undoStack[undoStack.length - 1]
    if (!undoItem) return
    setChangeStatus(undoItem.id, undoItem.previousStatus)
    setUndoStack(current => current.slice(0, -1))
    setSelectedChangeId(null)
  }

  function acceptRemaining() {
    setSegments(current => current.map(seg =>
      seg.type === 'change' && seg.status === 'pending' ? { ...seg, status: 'accepted' } : seg
    ))
    setSelectedChangeId(null)
  }

  function goToChange(offset) {
    if (pendingChanges.length === 0) return
    const index = pendingChanges.findIndex(seg => seg.id === selectedChangeId)
    const target = index === -1
      ? pendingChanges[offset > 0 ? 0 : pendingChanges.length - 1]
      : pendingChanges[(index + offset + pendingChanges.length) % pendingChanges.length]
    setSelectedChangeId(target.id)
    const node = changeRefs.current[target.id]
    if (node) node.scrollIntoView({block: 'center', inline: 'nearest'})
  }

  function copyFinalEdit() {
    navigator.clipboard.writeText(htmlToText(finalEditHtml))
  }

  function saveChanges() {
    fetch('/api/save_article/' + id, {
      method: 'PATCH',
      headers : {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updated_og_text: htmlToText(buildHtml(segments, 'del')),
        updated_edited_text: htmlToText(buildHtml(segments, 'ins'))
      })
    })
  }

  return (
    <div className='page-content articleLayout'>
      <div className='articleSidePanel'>
        <WorkshopTable embedded activeId={id} />
      </div>
      <div className='articleMain'>
        <div className='articleViews'>
          <button id='markup' className={'articleTab articlePanelButton' + (view === 'markup' ? ' tabSelected' : '')} onClick={() => setView('markup')}>Markup</button>
          <button id='finalEdit' className={'articleTab articlePanelButton' + (view === 'finalEdit' ? ' tabSelected' : '')} onClick={() => setView('finalEdit')}>Final Edit</button>
          <button id='sideCompare' className={'articleTab articlePanelButton' + (view === 'sideCompare' ? ' tabSelected' : '')} onClick={() => setView('sideCompare')}>Side-by-Side</button>
          <button id='submissionDetails' className={'articleTab articlePanelButton' + (view === 'submissionDetails' ? ' tabSelected' : '')} onClick={() => setView('submissionDetails')}>Submission Details</button>
        </div>
        <div className='editTools'>
          <button id='previousChange' className='articleButton articlePanelButton' onClick={() => goToChange(-1)}>Previous Change</button>
          <button id='nextChange' className='articleButton articlePanelButton' onClick={() => goToChange(1)}>Next Change</button>
          <button id={undoStack.length > 0 ? null : 'undo-inactive'} className='articleButton articlePanelButton' onClick={undo}>Undo</button>
          <button id='acceptRemaining' className='articleButton articlePanelButton' onClick={acceptRemaining}>Accept Remaining Changes</button>
          <button id='copyFinalEdit' className='articleButton articlePanelButton' onClick={copyFinalEdit}><FaRegCopy /></button>
          <button id='save' className='articleButton articlePanelButton' onClick={saveChanges}><FaRegSave /></button>
        </div>
        <div className='articleContent' onClick={() => setSelectedChangeId(null)}>
          <div className='articleText'>
            <div className='originalDisplay' style={{display:(view === 'sideCompare' ? 'block' : 'none')}}>
              <p dangerouslySetInnerHTML={{__html: originalText}}></p>
            </div>
            <div className='markupDisplay' style={{display:(view === 'markup' ? 'block' : 'none')}}>
              <p>
                {segments.map(seg => seg.type === 'static'
                  ? <span key={seg.id} dangerouslySetInnerHTML={{__html: seg.html}}></span>
                  : <Change key={seg.id} seg={seg} isSelected={seg.id === selectedChangeId}
                      onSelect={setSelectedChangeId} registerRef={registerChangeRef} />
                )}
              </p>
            </div>
            <div className='finalEditDisplay' style={{display: (view === 'finalEdit' || view === 'sideCompare' ? 'block' : 'none')}}>
              <p dangerouslySetInnerHTML={{__html: finalEditHtml}}></p>
            </div>
            <div className='submissionDetailsDisplay' style={{display:(view === 'submissionDetails' ? 'block' : 'none')}}>
              <p><b>Submission Time</b><br/>{date}</p>
              {prompt != "" &&
                <p><b>Prompt</b><br/>{prompt}</p>
              }
            </div>
          </div>
        </div>
          {view === 'markup' && popupPosition &&
          <div className='nodePanel' style={{position: 'absolute',
            top: popupPosition.top,
            left: popupPosition.left,
            display: 'inline-flex'
          }}>
              <button className='articleButton reject' onClick={() => decide('rejected')}>Reject</button>
              <button className='articleButton accept' onClick={() => decide('accepted')}>Accept</button>
        </div>}
      </div>
    </div>
  )
}
