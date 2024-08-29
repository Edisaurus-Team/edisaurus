import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import '../css/articleStyle.css'
import { FaRegCopy } from "react-icons/fa";


export default function Article() {
  const { id } = useParams()
  const[content, setContent] = useState([])
  const[selectedNode, setSelectedNode] = useState()
  const[undoStack, setUndoStack] = useState([])
  const[view, setView] = useState('markup')
  const[finalEdit, setFinalEdit] = useState(null)

  useEffect(() => {
      async function fetchData() {
          try {
              const response = await fetch('/api/get_article/' + id)
              const data = await response.json()
              setContent(data.htmlChanges)
          } catch (error) {
              console.error('Error:', error)
          }
      }
      fetchData()
  }, [id])
  
  useEffect(() => setFinalEdit(processFinalText), [content])
  useEffect(() => setFinalEdit(processFinalText), [undoStack])

  function processFinalText() {
    let currentEdit = document.createElement('div')
    currentEdit.innerHTML = document.querySelector('.articleContent').innerHTML
    let remainingDeletes = currentEdit.querySelectorAll('DEL')
    remainingDeletes.forEach(del => del.remove())
    let inserts = currentEdit.querySelectorAll('INS')
    inserts.forEach(ins => {
      let newNode = document.createElement('SPAN')
      newNode.innerHTML = ins.innerHTML
      ins.parentNode.replaceChild(newNode, ins)
    })
    return(currentEdit.innerHTML)
  }

  function handleDocumentClick(event) {
    if (event.target.nodeName == 'INS' || event.target.nodeName == 'DEL') {
      selectNode(event.target)
    } else if (event.target.id == 'acceptRemaining') {
      acceptRemaining()
      setFinalEdit(document.querySelector('.articleContent').innerHTML)
    } else if (event.target.id == 'nextChange') {
      nextChange()
    } else if (event.target.id == 'previousChange') {
      previousChange()
    } else if (event.target.id == 'markup') {
      console.log('viewing markup')
      setView('markup')
    } else if (event.target.id == 'finalEdit') {
      setContent(document.querySelector('.articleContent').innerHTML)
      console.log("viewing final edit")
      setView('finalEdit')
    } else {
      if (selectedNode) {
        if (selectedNode.ins) selectedNode.ins.className = ''
        if (selectedNode.del) selectedNode.del.className = ''
        setSelectedNode(null)
      }
    }
  }

  function copyFinalEdit() {
    let copiedText = document.createElement('div')
    copiedText.innerHTML = processFinalText().replace(/<br>/g, '\n');
    navigator.clipboard.writeText(copiedText.innerText)
  }

  async function selectNode(thisNode) {
    let delNode = null
    let insNode = null
    
    if (selectedNode) {
      if (selectedNode.ins) selectedNode.ins.className = ''
      if (selectedNode.del) selectedNode.del.className = ''
    }
    if (thisNode.nodeName == 'DEL') {
      thisNode.className = 'del-selected'
      delNode = thisNode
      if (thisNode.nextElementSibling !== null && thisNode.nextElementSibling.nodeName == 'INS') {
        insNode = thisNode.nextElementSibling
      }
    }
    if (thisNode.nodeName == 'INS') {
      thisNode.className = 'ins-selected'
      insNode = thisNode
      if (thisNode.previousElementSibling !== null && thisNode.previousElementSibling.nodeName == 'DEL') {
        delNode = thisNode.previousElementSibling
      }
    }
    setSelectedNode({
      'anchor': (delNode ? delNode : insNode).previousElementSibling,
      'del': delNode,
      'ins': insNode,
    })
  }

  function nextChange() {
    let change = null
    if (selectedNode) {
      change = (selectedNode.del ? selectedNode.del : selectedNode.ins)
    }
    if (!selectedNode) {
      change = document.querySelector('DEL, INS')
      selectNode(change)
      change.scrollIntoView({block: 'center', inline: 'nearest'})
      return
    }
    change.nextElementSibling.nodeName !== 'INS' ? change = change.nextElementSibling : change = change.nextElementSibling.nextElementSibling
    while (change && change.nodeName !== 'DEL' && change.nodeName !== 'INS') {
      change = change.nextElementSibling
    }
    selectNode(change)
    change.scrollIntoView({block: 'center', inline: 'nearest'})
  }

  function previousChange() {
    let change = null
    if (selectedNode) {
      change = (selectedNode.del ? selectedNode.del : selectedNode.ins)
    }
    if (!change) {
      const changes = document.querySelectorAll('DEL, INS')
      change = changes[changes.length - 1]
    }
    change.previousElementSibling.nodeName !== 'DEL' ? change = change.previousElementSibling : change = change.previousElementSibling.previousElementSibling
    while (change && change.nodeName !== 'DEL' && change.nodeName !== 'INS') {
      change = change.previousElementSibling
    }
    selectNode(change)
    change.scrollIntoView({block: 'center', inline: 'nearest'})
  }

  function acceptRemaining() {
    const deletes = document.querySelectorAll('DEL')
    deletes.forEach(del => del.remove())
    const inserts = document.querySelectorAll('INS')
    inserts.forEach(ins => {
      let newNode = document.createElement('SPAN')
      newNode.innerHTML = ins.innerHTML
      ins.parentNode.replaceChild(newNode, ins)
    })
  }

  function undo() {
    const undoItem = undoStack.slice(-1)[0]
    if (!undoItem) return
    if (undoItem.type == 'accept') {
      if (undoItem.ins) {
        let newNode = document.createElement('INS')
        newNode.innerHTML = undoItem.ins.innerHTML
        undoItem.anchor.parentNode.replaceChild(newNode, undoItem.anchor.nextElementSibling)
      }
      if (undoItem.del) {
        undoItem.anchor.after(undoItem.del)
      }
    }
    if (undoItem.type == 'reject') {
      if (undoItem.del) {
        let newNode = document.createElement('DEL')
        newNode.innerHTML = undoItem.del.innerHTML
        undoItem.anchor.parentNode.replaceChild(newNode, undoItem.anchor.nextElementSibling)
      }
      if (undoItem.ins && undoItem.del) {
        undoItem.anchor.nextElementSibling.after(undoItem.ins)
      } else if (undoItem.ins) {
        undoItem.anchor.after(undoItem.ins)
      }
    }
    popStack()
  }

  function addToStack(type) {
    setUndoStack(currentStack => [
      ...currentStack, {
        ...selectedNode,
        'type': type
      }
    ])
  }

  function popStack() {
    setUndoStack(currentStack => currentStack.slice(0, currentStack.length - 1))
  }

  function accept() {
    addToStack('accept')
    if (selectedNode.ins) {
      let newNode = document.createElement('SPAN')
      newNode.innerHTML = selectedNode.ins.innerHTML
      selectedNode.ins.parentNode.replaceChild(newNode, selectedNode.ins)        
    }
    if (selectedNode.del) selectedNode.del.remove()
  }
  function reject() {
    addToStack('reject')
    if (selectedNode.del) {
      let newNode = document.createElement('SPAN')
      newNode.innerHTML = selectedNode.del.innerHTML
      selectedNode.del.parentNode.replaceChild(newNode, selectedNode.del)        
    }
    if (selectedNode.ins) selectedNode.ins.remove()
  }

  return (
    <div className='page-content' onClick={(event) => handleDocumentClick(event)}>
      <div className='articlePanel'>
        <div className='topLeft'>
          <button id='markup' className='articleTab articlePanelButton'>Markup</button>
          <button id='finalEdit' className='articleTab articlePanelButton'>Final Edit</button>
        </div>
        <div className='topRight'>
          <button id="copyFinalEdit" className='articleButton articlePanelButton' onClick={copyFinalEdit}><FaRegCopy /></button>
          <button id='acceptRemaining' className='articleButton articlePanelButton'>Accept Remaining Changes</button>
          <button id='previousChange' className='articleButton articlePanelButton'>Previous Change</button>
          <button id='nextChange' className='articleButton articlePanelButton'>Next Change</button>
          <button id={undoStack.length > 0 ? null : 'undo-inactive'} className='articleButton articlePanelButton' onClick={undo}>Undo</button>
        </div>
      </div>
      <div className='articleContent'>
        {view == 'markup' && <p dangerouslySetInnerHTML={{__html: content}}></p>}
        {view == 'finalEdit' && <p dangerouslySetInnerHTML={{__html: finalEdit}}></p>}
      </div>
        {selectedNode &&      
        <div className='nodePanel' style={{position: 'absolute', 
          top: (selectedNode.del ? selectedNode.del.offsetTop : selectedNode.ins.offsetTop) + 25, 
          left: (selectedNode.del ? selectedNode.del.offsetLeft : selectedNode.ins.offsetLeft),
          display: 'inline-flex'
        }}>
            <button className='articleButton reject' onClick={reject}>Reject</button>      
            <button className='articleButton accept' onClick={accept}>Accept</button>
      </div>}
    </div>
  )
}