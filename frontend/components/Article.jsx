import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ArticlePanel from './ArticlePanel'


import '../css/articleStyle.css'


export default function Article() {
    const { id } = useParams()
    const[content, setContent] = useState([])
    const[selectedNode, setSelectedNode] = useState(null)
    
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
        if (thisNode.nextElementSibling.nodeName == 'INS') {
          insNode = thisNode.nextElementSibling
        }
      }
      if (thisNode.nodeName == 'INS') {
        thisNode.className = 'ins-selected'
        insNode = thisNode
        if (thisNode.previousElementSibling.nodeName == 'DEL') {
          delNode = thisNode.previousElementSibling
        }
      }
      setSelectedNode({
        'anchor': thisNode,
        'del': delNode,
        'ins': insNode,
      })
    }

    function accept() {
      if (selectedNode.ins) {
        let newNode = document.createElement('SPAN')
        newNode.innerHTML = selectedNode.ins.innerHTML
        selectedNode.ins.parentNode.replaceChild(newNode, selectedNode.ins)        
      }
      if (selectedNode.del) selectedNode.del.remove()
    }
    function reject() {
      if (selectedNode.del) {
        let newNode = document.createElement('SPAN')
        newNode.innerHTML = selectedNode.del.innerHTML
        selectedNode.del.parentNode.replaceChild(newNode, selectedNode.del)        
      }
      if (selectedNode.ins) selectedNode.ins.remove()
    }

    return (
      <div className='page-content' onClick={(event) => handleDocumentClick(event)}>
        <div className='articleContent'>
          <p dangerouslySetInnerHTML={{ __html: content.htmlChanges }}></p>
          {selectedNode && (
          <div className='nodePanel' style={{ height: '35px', width: '111px', position: 'absolute', top: selectedNode.anchor.offsetTop + 25, left: selectedNode.anchor.offsetLeft }}>
            <button className='reject' onClick={reject} style={{height:'100%'}}>reject /</button>
            <button className='accept' onClick={accept} style={{height:'100%'}}>/ accept</button>
          </div>
        )}
        </div>
      </div>
    )
}