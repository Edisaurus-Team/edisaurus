import React, {useState, useEffect} from "react";
import "../css/uploaderStyle.css"
import { FaArrowLeft, FaAnglesRight } from "react-icons/fa6";

export default function Uploader() {
    const [response, setResponse] = useState('');
    const [sliderValue, setSliderValue] = useState(0)
    const [modelChoice, setModelChoice] = useState('gpt-4o-mini')
    const [editChoice, setEditChoice] = useState('copyedit')
    const [leftPanelExpanded, setLeftPanelExpanded] = useState(false);
    const [windowExpanded, setWindowExpanded] = useState(window.innerWidth > 1049)
    const [formVisible, setFormVisible] = useState(true)
    const [customPrompt, setCustomPrompt] = useState("")

    async function fetchStream(event) {
        event.preventDefault();
        const inputText = event.target.elements.copyeditText.value;
        setFormVisible(false)
        const response = await fetch('/api/stream_response/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                submit_text: inputText,
                edit_type: editChoice,
                temperature: sliderValue,
                model: modelChoice,
                custom_prompt: customPrompt
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

    useEffect(() => {
        const handleResize = () => {
          setWindowExpanded(window.innerWidth > 1049);
        };    
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    async function saveAndRedirect(inputText, outputText) {
        const newArticle = await fetch('/api/create_article/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                submit_text: inputText,
                edited_text: outputText,
                edit_type: editChoice,
                temperature: sliderValue,
                model_choice: modelChoice,
                custom_prompt: customPrompt
            }),
        });
        const id = await newArticle.json();
        window.location.href = '/workshop/' + id.articleId
    };

    function leftExpand(event) {
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
    function handlePromptChange(event) {
        setCustomPrompt(event.target.value)
    }

    return (
        <div className="page-content">    
            <div className="pageRow">
                <div className="pageLeftExpand" onClick={leftExpand} style={leftPanelExpanded ? {visibility:'hidden'} : {visibility: 'visible'}}>
                    <FaAnglesRight style={{fontSize:'30px'}} />    
                </div>
                <div id="pageLeft" className="pageLeft" 
                    style={{
                        visibility:(windowExpanded ? 'visible' : (leftPanelExpanded ? 'visible' : 'hidden'))
                    }}>
                    <div style={{marginBottom:"20px"}}>
                        <h3>settings</h3>
                    </div>
                    <div className="leftPanelItem">
                        <p>Choose edit type</p>
                        <select id="edit-choice" className="leftPanelInput" name="edit-choice" onChange={(event) => handleEditChange(event)}>
                            <option value="copyedit">Copyedit</option>
                            <option value="resume">Edit a resume</option>
                            <option value="custom">Custom Prompt</option>
                        </select>
                    </div>
                    <div className="leftPanelItem">
                        <p>Choose model</p>
                        <select id="model-choice" className="leftPanelInput" name="model-choice" onChange={(event) => handleModelChange(event)}>
                            <option value="gpt-4o-mini">GPT-4o mini</option>
                            <option value="gpt-4o">GPT-4o</option>
                            {/* <option value="o3-mini">o3-mini</option> */}
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                    </div>
                    <div className="leftPanelItem">
                        <div className="tool-tip-wrapper">
                            <p>Temperature: <span>{sliderValue}</span></p>
                            <div className="tool-tip leftPanelToolTip">
                                Increases the randomness of output. <br/>
                                (A lower temperature works best for editing)
                            </div>

                        </div>
                        <input type="range" min="0" max="1.9" step="0.01" value={sliderValue} onChange={(event) => handleSliderChange(event)}/>
                        <div className={sliderValue > 1.89 ? "alert alert-danger panel-alert" : ""} role="alert">
                            {sliderValue > 1.89 ? "Temp values above 1.9 result in unusable output!" : "" }
                        </div>
                    </div>
                    <div id="panelClose" onClick={leftExpand}>
                        <FaArrowLeft style={{fontSize:'30px'}} />
                    </div>
                </div>

                <div className="pageRight" style={{visibility:(windowExpanded ? 'visible' : (leftPanelExpanded ? 'hidden' : 'visible'))}}>
                    <div className="pageTitle">
                        <h1>Uploader</h1>
                    </div>
                    {editChoice == "custom" && (
                        <div className="form-group">
                            <p>Prompt:</p>
                            <textarea className="wide-text" type="text" rows="2" onChange={(event) => handlePromptChange(event)} placeholder="You are a professional copy editor who fixes typos and grammatical mistakes in text." />
                        </div>
                    )}
                    {formVisible && (
                        <form id="copyeditForm" method="post" onSubmit={fetchStream} encType="multipart/form-data">
                            <h3>Paste text to be corrected</h3>
                            <div className="form-group">
                                <textarea id="copyeditText" name="text_box"></textarea>
                            </div>
                            <div>
                                <button className="btn btn-dark" type="submit" name="submitCopyedit" value="submitCopyedit">Submit text</button>    
                            </div>
                        </form>
                    )}
                    <div className="articleContent">
                        <>{response}</>
                    </div>
                </div>
            </div>
        </div>
    );
}