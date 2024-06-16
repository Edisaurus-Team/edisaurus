// import React from "react";

export default function Home() {
  return (
  <div className="page-content">
    <div className="page-title">
        <h1>CopyeditorGPT TURBO 3000</h1>
    </div>
    <div className="main-image">
        <img src="/static/images/robot_working.png"/>
    </div>
    <h2 className="about-header"><a href="/uploader">Uploader</a></h2>
    <p>Get started by uploading a document.</p>
    <h2 className="about-header"><a href="/workshop">Workshop</a></h2>
    <p>Review changes in the workshop.</p>
    <h2 className="about-header"><a href="/about">About</a></h2>
    <p>More info here!</p>
  </div>
  )
}
