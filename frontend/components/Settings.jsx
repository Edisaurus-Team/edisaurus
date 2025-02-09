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
            <div className="page-title">
                <h1>Settings for {content.user}</h1>
            </div>
            <div className="api-key-cont">
                <div className="api-key-cont-inner">
                    <h2 className="spaced-15px">API key: </h2>
                    <div className="api-key-data-and-form">
                        <span className="api-key-data" style={{display: apiKeyDisplay ? 'none' : 'flex'}}>
                            <p className="spaced-15px">{content.apiKey}</p>
                            <FaPencilAlt className="api-key-edit" onClick={editKey} /></span>
                        <form class="api-key-form" action="" method="post" style={{display: apiKeyDisplay ? 'block' : 'none'}}>
                            <div class="form-group">
                                <input id="api-key-input" class="form-control" type="text" name="api-key" placeholder="OpenAI API Key" onChange={updateApiKey} />
                            </div>
                            <div>
                                <input id="api-form-submit" class="btn btn-dark" type="button" value="Submit" onClick={keySubmit}/>
                                <input id="api-form-cancel" class="btn btn-light spaced-15px" type="button" value="Cancel" onClick={editKey} />
                            </div>
                        </form>
                    </div>
                </div>
                <div style={{color:"#5d5d5d"}}>
                    <p>Saving your OpenAI API key is optional. If you don't provide one, your account will make use of site tokens.</p>
                    <p>Site tokens are provided to all accounts for free, until the monthly amount depletes.</p>
                </div>
            </div>
        </div>
    )
}