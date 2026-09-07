import React, {useState, useEffect} from "react";
import "../css/uploaderStyle.css"
import { FaArrowLeft, FaAnglesRight } from "react-icons/fa6";

export default function Uploader() {
    const [response, setResponse] = useState('');
    const [leftPanelExpanded, setLeftPanelExpanded] = useState(false);
    const [windowExpanded, setWindowExpanded] = useState(window.innerWidth > 1049)
    const [formVisible, setFormVisible] = useState(true)
    const [customPrompt, setCustomPrompt] = useState("You are a professional copy editor who fixes typos and grammatical mistakes in text. Follow the Chicago Manual of Style for making corrections. Make MINIMAL edits to the voice or style of the prose, only correcting obvious errors. Return the text in its final corrected form, with no additional markup. The text will be compared to the original with a diff library. It must match the original text exactly, other than the needed corrections.")

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
                custom_prompt: customPrompt
            }),
        });
        const id = await newArticle.json();
        window.location.href = '/workshop/' + id.articleId
    };

    function leftExpand(event) {
        setLeftPanelExpanded(leftPanelExpanded == true ? false : true)
    }
    function handlePromptChange(event) {
        setCustomPrompt(event.target.value)
    }
    function handlePromptFocus(event) {
        event.target.select()
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
                        <h3>Files</h3>
                    </div>
                    <div id="panelClose" onClick={leftExpand}>
                        <FaArrowLeft style={{fontSize:'30px'}} />
                    </div>
                </div>

                <div className="pageRight" style={{visibility:(windowExpanded ? 'visible' : (leftPanelExpanded ? 'hidden' : 'visible'))}}>
                    {formVisible && (
                        <form id="copyeditForm" method="post" onSubmit={fetchStream} encType="multipart/form-data">
                            <div className="form-group">
                                <p>Prompt:</p>
                                <textarea className="wide" type="text" rows="2" onChange={(event) => handlePromptChange(event)} onFocus={handlePromptFocus} value={customPrompt} required />
                            </div>
                            <h3>Paste text to be corrected</h3>
                            <div className="form-group">
                                <textarea id="copyeditText" name="text_box" required></textarea>
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