import React, { useState, useEffect } from 'react';
import { FaPencilAlt } from "react-icons/fa";

export default function Settings() {
    
    const [content, setContent] = useState([]);
    const [apiKeyDisplay, setApiKeyDisplay] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/settings/', {
                    method: 'GET'
                });
                const data = await response.json();
                data.apiKey = data.apiKey.replace(/.(?<=.{10})/g, '*')
                setContent(data)
                console.log(data)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchData();
    }, []);

    function editKey() {
        setApiKeyDisplay(apiKeyDisplay == true ? false : true)
    }
    
    function keySubmit() {
            fetch('/api/settings/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    updated_key: content.apiKey
                })
            });
        setApiKeyDisplay(apiKeyDisplay == true ? false : true);
    }
    
    function updateApiKey(event) {
        setContent(prevData => {
            return {
                ...prevData,
                apiKey: event.target.value
            }
        })
    }

    return (
        <div className="page-content">
            <p>Currently not in use</p>
        </div>
    )
}