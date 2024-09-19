// import React from "react";
import home_thumbnail from "../images/home_thumbnail.png";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <a href="/">
        <img src={home_thumbnail} style={{ width: 50 }} />
      </a>
      <div className="navPages">
        <li>
          <NavLink className="navItem" to="/uploader/">
            Uploader
          </NavLink>
        </li>
        <li>
          <NavLink className="navItem" to="/workshop/">
            Workshop
          </NavLink>
        </li>
        <li>
          <NavLink className="navItem" to="/about/">
            About
          </NavLink>
        </li>
      </div>
      <div className="navAccount">
        <NavLink className="accountItem" to="/settings/">
          Settings
        </NavLink>
        <a className="accountItem" href="/logout/">Logout</a>
      </div>
    </nav>
  );
}
