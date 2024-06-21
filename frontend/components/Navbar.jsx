// import React from "react";
import home_thumbnail from '../images/home_thumbnail.png'

export default function Navbar() {
  return (
    <nav>
        <a href="/"><img src={home_thumbnail} style={{width:50}}/></a>
        <ul>
            <li><a href="/uploader/">Uploader</a></li>
            <li><a href="/workshop/">Workshop</a></li>
            <li><a href="/about/">About</a></li>
        </ul>
        <div className="navbar-buttons">
            <a href="/settings/">Settings</a>
            <a href="/logout/"><button className="btn btn-dark">Logout</button></a>
        </div>
    </nav>   
  )
}
