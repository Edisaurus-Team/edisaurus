import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import '../css/articleStyle.css'


export default function Article() {
    const { id } = useParams()
    const[content, setContent] = useState([])
    const[selectedNode, setSelectedNode] = useState(null)
    const[undoStack, setUndoStack] = useState([])
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/get_article/' + id)
                const data = await response.json()
                setContent(data)
            } catch (error) {
                console.error('Error:', error)
            }
        }
        fetchData()
    }, [id])
    
    function handleDocumentClick(event) {
      if (event.target.nodeName == 'INS' || event.target.nodeName == 'DEL') {
        selectNode(event.target)
      } else if (event.target.id == 'nextChange') {
        nextChange()
      } else if (event.target.id == 'previousChange') {
        previousChange()
      } else {
        setSelectedNode(null)
      }
    }

    //Need to implement this in a non-hacky way...
    //Shouldn't have to use querySelector to deselect
    function selectNode(thisNode) {
      const deselect = document.querySelector('.ins-selected, .del-selected')
      let delNode = null
      let insNode = null

      if (deselect) {
        deselect.className = ''
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
      let change = document.querySelector('.del-selected, .ins-selected')
      if (!change || change.nextElementSibling == null) {
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
      let change = document.querySelector('.del-selected, .ins-selected')
      if (!change) change = document.querySelector('#end')
      console.log(change)
      change.previousElementSibling.nodeName !== 'DEL' ? change = change.previousElementSibling : change = change.previousElementSibling.previousElementSibling
      while (change && change.nodeName !== 'DEL' && change.nodeName !== 'INS') {
        change = change.previousElementSibling
      }
      selectNode(change)
      change.scrollIntoView({block: 'center', inline: 'nearest'})
    }

    function undo() {
      const undoItem = undoStack.slice(-1)[0]
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
            <button id='previousChange' className='articleButton articlePanelButton'>Previous Change</button>
            <button id='nextChange' className='articleButton articlePanelButton'>Next Change</button>
            <button id={undoStack.length > 0 ? null : 'undo-inactive'} className='articleButton articlePanelButton' onClick={undo}>Undo</button>
          </div>
        </div>
        <div className='articleContent'>
          <p dangerouslySetInnerHTML={{ __html: content.htmlChanges }}></p>
        </div>
          {selectedNode && (
          <div className='nodePanel' style={{position: 'absolute', 
            top: (selectedNode.del ? selectedNode.del.offsetTop : selectedNode.ins.offsetTop) + 25, 
            left: (selectedNode.del ? selectedNode.del.offsetLeft : selectedNode.ins.offsetLeft)}}>
            
            <button className='articleButton reject' onClick={reject}>Reject</button>
            <button className='articleButton accept' onClick={accept}>Accept</button>
          </div>
        )}
      </div>
    )
}