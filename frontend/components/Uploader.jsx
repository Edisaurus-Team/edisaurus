// import React from "react";

export default function Uploader() {
    return (
        <div className="page-content">
            <div className="page-title">
                <h1>Uploader</h1>
            </div>
            <form id="upload-form" action="/api/uploader/" method="post" enctype="multipart/form-data">
                <h3>Paste your text below</h3>
                <div className="form-group">
                    <textarea id="upload-text" className="form-control" name="text_box" rows="5"></textarea>
                </div>
                <div>
                    <button className="btn btn-dark" type="submit" name="upload" value="upload_text">Submit text</button>    
                    <div id="blank-text-alert" className="alert alert-info" role="alert">
                        No text detected.
                    </div>
                </div>
            </form>
        </div>
    );
}