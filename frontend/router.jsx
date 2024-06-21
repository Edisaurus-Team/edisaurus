import { createBrowserRouter } from "react-router-dom";
// import React from "react"
import Root from "./Root";
import Home from "./components/Home";
import About from "./components/About";
import WorkshopTable from "./components/WorkshopTable";
import Settings from "./components/Settings";
import Article from "./components/Article";
import Uploader from "./components/Uploader";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />
      },
      {
        path: "/workshop",
        element: <WorkshopTable />,
      },
      {
        path: "workshop/:id",
        element: <Article />
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/uploader",
        element: <Uploader />,
      }
    ],
  },
]);

export default router;
