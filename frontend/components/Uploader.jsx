import React, {useState, useEffect, useRef} from "react";
import WorkshopTable from './WorkshopTable'
import "../css/uploaderStyle.css"
import { FaBars, FaXmark } from "react-icons/fa6";

export default function Uploader() {
    const [response, setResponse] = useState('');
    const [leftPanelExpanded, setLeftPanelExpanded] = useState(false);
    const [formVisible, setFormVisible] = useState(true)
    const [customPrompt, setCustomPrompt] = useState("You are a professional copy editor who fixes typos and grammatical mistakes in text. Follow the Chicago Manual of Style for making corrections. Make MINIMAL edits to the voice or style of the prose, only correcting obvious errors. Return the text in its final corrected form, with no additional markup. The text will be compared to the original with a diff library. It must match the original text exactly, other than the needed corrections.")
    const promptRef = useRef(null);

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
        if (promptRef.current) {
            promptRef.current.style.height = 'auto';
            promptRef.current.style.height = promptRef.current.scrollHeight + 'px';
        }
    }, [customPrompt]);

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

    function toggleLeftPanel() {
        setLeftPanelExpanded(expanded => !expanded)
    }
    function handlePromptChange(event) {
        setCustomPrompt(event.target.value)
    }
    function handlePromptFocus(event) {
        event.target.select()
    }
    function handleTextareaResize(event) {
        event.target.style.height = 'auto';
        event.target.style.height = event.target.scrollHeight + 'px';
    }

    return (
        <div className="page-content">
            <div className="pageRow">
                {/* Only visible in the narrow layout; CSS hides it on desktop */}
                <button type="button" className="menuToggle" aria-label="Open menu" aria-expanded={leftPanelExpanded} onClick={toggleLeftPanel}>
                    <FaBars />
                </button>

                <div id="pageLeft" className={leftPanelExpanded ? 'pageLeft pageLeft--open' : 'pageLeft'}>
                    <button type="button" className="panelClose" aria-label="Close menu" onClick={toggleLeftPanel}>
                        <FaXmark />
                    </button>
                    <div style={{marginBottom:"20px"}}>
                        <WorkshopTable embedded />
                    </div>
                </div>

                <div className="pageRight">
                    {formVisible && (
                        <form id="copyeditForm" method="post" onSubmit={fetchStream} encType="multipart/form-data">
                            <div className="form-group">
                                <p>Prompt:</p>
                                <textarea ref={promptRef} className="wide auto-grow copyedit-textarea" type="text" onChange={(event) => handlePromptChange(event)} onFocus={handlePromptFocus} value={customPrompt} required />
                            </div>
                            <div id="submit-box" className="form-group">
                                <h3>Paste text to be corrected:</h3>
                                <textarea id="copyeditText" className="auto-grow copyedit-textarea" onInput={handleTextareaResize} name="text_box" required></textarea>
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
