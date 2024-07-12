import React, {useState} from "react";
import "../css/uploaderStyle.css"

export default function Uploader() {
    const [response, setResponse] = useState('');

    async function fetchStream(event) {
        event.preventDefault();
        const inputText = document.getElementById('upload-text').value
        const response = await fetch('/api/stream_response/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ submit_text: inputText }),
        });
    
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let outputText = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            outputText += decoder.decode(value);
            setResponse(outputText);
        }
        saveAndRedirect(inputText, outputText)
    };
    
    async function saveAndRedirect(inputText, outputText) {
        const newArticle = await fetch('/api/uploader/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                submit_text: inputText,
                edited_text: outputText,
            }),
        });
        const id = await newArticle.json();
        window.location.href = '/workshop/' + id.articleId
    };

    return (
        <div className="page-content">
            <div className="page-title">
                <h1>Uploader</h1>
            </div>
            <form id="upload-form" method="post" encType="multipart/form-data">
                <h3>Paste text to be corrected</h3>
                <div className="form-group">
                    <textarea id="upload-text" name="text_box" className="uploadTextBox"></textarea>
                </div>
                <div>
                    <button className="btn btn-dark" onClick={fetchStream} type="submit" name="upload" value="upload_text">Submit text</button>    
                </div>
            </form>
            <div className="articleContent">
                <p>{response}</p>
            </div>
        </div>
    );
}