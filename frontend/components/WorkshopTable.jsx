import React, { useState, useEffect } from 'react';

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
                            <a href={`/workshop/${article.id}`}>
                                <td>{article.title}</td>
                            </a>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}