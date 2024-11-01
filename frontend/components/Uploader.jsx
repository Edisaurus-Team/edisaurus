import React, {useState} from "react";
import "../css/uploaderStyle.css"

export default function Uploader() {
    const [response, setResponse] = useState('');
    const [sliderValue, setSliderValue] = useState(1)
    const [modelChoice, setModelChoice] = useState('gpt-4o-mini')
    const [editChoice, setEditChoice] = useState('copyedit')
    const [leftPanelExpanded, setLeftPanelExpanded] = useState(false);

    async function fetchStream(event) {
        event.preventDefault();
        const inputText = document.getElementById('copyeditText').value
        const response = await fetch('/api/stream_response/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                submit_text: inputText,
                edit_type: editChoice,
                temperature: sliderValue,
                model: modelChoice
            }),
        });
    
        //stream response from OpenAI onto the page
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
        const newArticle = await fetch('/api/create_article/', {
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

    function leftExpand() {
        setLeftPanelExpanded(leftPanelExpanded == true ? false : true)
    }

    function handleEditChange(event) {
        setEditChoice(event.target.value)
    }
    function handleModelChange(event) {
        setModelChoice(event.target.value)
    }
    function handleSliderChange(event) {
        setSliderValue(event.target.value)
    }

    console.log(window.innerWidth)
    return (
        <div className="page-content">    
            <div className="pageRow">
                {/* desktop view */}
                {window.innerWidth > 1049 && 
                <div className="pageLeft">
                    <div style={{marginBottom:"20px"}}>
                        <h3>settings</h3>
                    </div>
                    <div className="leftPanelItem">
                        <p>Choose edit type</p>
                        <select id="edit-choice" className="leftPanelInput" name="edit-choice" onChange={(event) => handleEditChange(event)}>
                            <option value="copyedit">Copyedit</option>
                            <option value="resume">Edit a resume</option>
                        </select>
                    </div>
                    <div className="leftPanelItem">
                        <p>Choose model</p>
                        <select id="model-choice" className="leftPanelInput" name="model-choice" onChange={(event) => handleModelChange(event)}>
                            <option value="gpt-4o-mini">GPT-4o mini</option>
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="o1-preview">o1-preview</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                    </div>
                    <div className="leftPanelItem">
                        <p>Temperature: <span>{sliderValue}</span></p>
                        <input type="range" min="0" max="2" step="0.01" value={sliderValue} onChange={(event) => handleSliderChange(event)}/>
                    </div>
                </div>}
                {/* mobile view */}
                {window.innerWidth < 1049 && 
                <div className="pageLeftExpand" onClick={leftExpand} style={leftPanelExpanded ? {visibility:'hidden'} : {visibility: 'visible'}}>
                    <p>...</p>    
                </div>}
                {window.innerWidth < 1049 && 
                <div className="pageLeft" style={leftPanelExpanded ? {visibility:'visible'} : {visibility: 'hidden'}}>
                    
                        <div style={{marginBottom:"20px"}}>
                            <h3>settings</h3>
                        </div>
                        <div className="closePanel" onClick={leftExpand}>
                            <p>X</p>
                        </div>
                    
                    <div className="leftPanelItem">
                        <p>Choose edit type</p>
                        <select id="edit-choice" className="leftPanelInput" name="edit-choice" onChange={(event) => handleEditChange(event)}>
                            <option value="copyedit">Copyedit</option>
                            <option value="resume">Edit a resume</option>
                        </select>
                    </div>
                    <div className="leftPanelItem">
                        <p>Choose model</p>
                        <select id="model-choice" className="leftPanelInput" name="model-choice" onChange={(event) => handleModelChange(event)}>
                            <option value="gpt-4o-mini">GPT-4o mini</option>
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="o1-preview">o1-preview</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                    </div>
                    <div className="leftPanelItem">
                        <p>Temperature: <span>{sliderValue}</span></p>
                        <input type="range" min="0" max="2" step="0.01" value={sliderValue} onChange={(event) => handleSliderChange(event)}/>
                    </div>
                </div>}


                <div className="pageRight" style={leftPanelExpanded ? {visibility:'hidden'} : {visibility: 'visible'}}>
                    <div className="pageTitle">
                        <h1>Uploader</h1>
                    </div>         
                    <form id="copyeditForm" method="post" encType="multipart/form-data">
                        <h3>Paste text to be corrected</h3>
                        <div className="form-group">
                            <textarea id="copyeditText" name="text_box"></textarea>
                        </div>
                        <div>
                            <button className="btn btn-dark" onClick={((event) => fetchStream(event))} type="submit" name="submitCopyedit" value="submitCopyedit">Submit text</button>    
                        </div>
                    </form>
                    <div className="articleContent">
                        <p>{response}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}