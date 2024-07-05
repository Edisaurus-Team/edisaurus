import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Table () {
    
    const[content, setContent] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/get_table/');
                const data = await response.json();
                setContent(data)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchData();
    }, []);
    console.log(content)
    return (
        <div>
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
                            <td>
                                <NavLink to={`/workshop/${article.id}`}>{article.title}</NavLink>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}