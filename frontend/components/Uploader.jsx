// import React from "react";
import "../css/uploaderStyle.css"

export default function Uploader() {
    return (
        <div className="page-content">
            <div className="page-title">
                <h1>Uploader</h1>
            </div>
            <form id="upload-form" action="/api/uploader/" method="post" encType="multipart/form-data">
                <h3>Paste text to be corrected</h3>
                <div className="form-group">
                    <textarea id="upload-text" name="text_box" className="uploadTextBox"></textarea>
                </div>
                <div>
                    <button className="btn btn-dark" type="submit" name="upload" value="upload_text">Submit text</button>    
                </div>
            </form>
        </div>
    );
}