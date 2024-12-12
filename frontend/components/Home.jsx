import React from "react";
import head_image from '../images/Head.png'

export default function Home() {
  return (
  <div className="page-content">
    <div className="page-title">
        <h1>Copy-Paste Editor</h1>
    </div>
    <div className="main-image">
        <img style={{width:"calc(200px + 20vw"}} src={head_image} />
    </div>
    <div className="home-links">
      <div className="aqua-hover padded-10px">
        <h2><a href="/uploader/">Uploader</a></h2>
        <p>Get started by pasting in some text</p>
      </div>
      <div className="aqua-hover padded-10px">
        <h2><a href="/workshop/">Workshop</a></h2>
        <p>Review your changes</p>
      </div>
      <div className="aqua-hover padded-10px">
        <h2><a href="/about/">About</a></h2>
        <p>More info here!</p>
      </div>
    </div>
  </div>
  )
}
