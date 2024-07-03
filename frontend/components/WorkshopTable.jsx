import React, { useState, useEffect } from 'react';
import trashIcon from "../images/trash_icon.png";

export default function Table () {

    const[content, setContent] = useState([]);

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

    function trashIconEvent(id) {
        console.log(`Delete icon clicked: ${id}`);
        fetch('/api/workshop_api/' + id, {
            method: 'DELETE',
            body: JSON.stringify({
            id: id
            })
        })
        updateTable();
    }

  return (
    <div className="page-content">
      <h1>Workshop Dashboard</h1>
      <table>
      <thead>
      <tr>
          <th>ID</th>
          <th>Title</th>
      </tr>
      </thead>
      <tbody>
          {content.map(article => (
          <tr key={article.id}>
            <td>{article.id}</td>
            <a href={`/workshop/${article.id}`}>
              <td>{article.title}</td>
            </a>
            <td>
              <span onClick={() => trashIconEvent(article.id)} id={article.id} className="trash-wrapper">
                <img id={article.id} src={trashIcon} className="icon" />
              </span>
            </td>
          </tr>
          ))}
      </tbody>
      </table>
    </div>
  )
}