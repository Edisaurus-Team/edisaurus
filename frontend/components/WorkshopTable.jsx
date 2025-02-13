import React, { useState, useEffect } from 'react';
import { FaRegTrashCan } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";

import "../css/workshopTableStyle.css"

export default function Table () {

    const [content, setContent] = useState([]);
    const [clickedIcon, setClickedIcon] = useState([]);

    async function updateTable() {
      try {
        const response = await fetch('/api/get_table/');
        const data = await response.json();
        setContent(data)
      } catch (error) {
        console.error('Error:', error);
      }
    }
    useEffect(() => {
      updateTable();
    }, []);
 
    function handleTrashIconClick(id) {
      setClickedIcon({
        id: (clickedIcon.id === id ? null : id)
      })
    };
    
    function deleteArticle(id) {
        console.log(`article ${id} deleted`)
        fetch('/api/workshop_api/' + id, {
          method: 'DELETE',
        })
        .then(response => {
          if (response.ok) {
            const updatedContent = content.filter(article => article.id !== id);
            setContent(updatedContent);
          } else {
            console.error('Error: article not found.');
          }
        })
    }

  return (
    <div className="page-content">
      <h1>Workshop Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Your Articles</th>
          </tr>
        </thead>
      <tbody>
          {content.map(article => (
          <tr key={article.id}>
            {/* TITLE */}
            <td>
              <div className="workshop-table-article aqua-hover"><a href={`/workshop/${article.id}`}>{article.title}</a></div>
            </td>
            {/* TRASH CAN */}
            <td>
              <div className="red-hover spaced-15px padded-10px">
                <div 
                  className={article.id === clickedIcon.id ? "trash-wrapper selected" : "trash-wrapper"} 
                  onClick={() => handleTrashIconClick(article.id)}
                >
                  <FaRegTrashCan className="icon trash-icon" />
                </div>
              </div> 
            </td>
            <td>
              <div  
                style={{visibility: article.id == clickedIcon.id ? 'visible' : 'hidden'}}
                onClick={() => deleteArticle(article.id)}
              >
                <FaCheck  
                  className="icon check-icon"
                />
              </div>

            </td>
          </tr>
          ))}
      </tbody>
      </table>
    </div>
  )
}