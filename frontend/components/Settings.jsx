import React, { useState, useEffect } from 'react';

export default function Settings() {
    
    const[content, setContent] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/settings');
                const data = await response.json();
                console.log(data)
                setContent(data)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchData();
    }, []);

    
    
    return (
        <div className="page-title">
            <h1>Settings for {content.user}</h1>
        </div>
    )
}