import React, { useState, useEffect } from 'react';

export default function Workshop () {
    
    const[content, setContent] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api');
                const data = await response.json();
                setContent(data)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchData();
    }, []);
    
    // create the table of the user's submissions. Need to set up dynamic routing so that each article title is a clickable link.
    return (
        <div>
            <h1>Workshop</h1>
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
                            <a href={`/workshop/${article.id}`}><td>{article.title}</td></a>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}