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
        <a href="/uploader/">
          <h2>Uploader</h2>
          <p>Get started by pasting in some text</p>
        </a>
      </div>
      <div className="aqua-hover padded-10px">
      <a href="/workshop/">
          <h2>Workshop</h2>
          <p>Review your changes</p>
        </a>
      </div>
      <div className="aqua-hover padded-10px">
        <a href="/about/">
          <h2>About</h2>
          <p>More info here!</p>
        </a>
      </div>
    </div>
  </div>
  )
}
