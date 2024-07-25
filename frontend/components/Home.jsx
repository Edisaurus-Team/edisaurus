import React from "react";
import head_image from '../images/Head.png'

export default function Home() {
  return (
  <div className="page-content">
    <div className="page-title">
        <h1>EDISAURUS</h1>
    </div>
    <div className="main-image" style={{width:300}}>
        <img src={head_image} />
        
    </div>
    <h2 className="about-header"><a href="/uploader/">Uploader</a></h2>
    <p>Get started by uploading a document.</p>
    <h2 className="about-header"><a href="/workshop/">Workshop</a></h2>
    <p>Review changes in the workshop.</p>
    <h2 className="about-header"><a href="/about/">About</a></h2>
    <p>More info here!</p>
  </div>
  )
}
