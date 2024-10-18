import home_thumbnail from "../images/home_thumbnail.png";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <div className="homeIcon">
        <a href="/">
          <img src={home_thumbnail} style={{ width: 50 }} />
        </a>
      </div>
      <div className="navPages">
          <NavLink className="navItem" to="/uploader/">
            Uploader
          </NavLink>  
          <NavLink className="navItem spaced-15px" to="/workshop/">
            Workshop
          </NavLink>
          <NavLink className="navItem" to="/about/">
            About
          </NavLink>
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
