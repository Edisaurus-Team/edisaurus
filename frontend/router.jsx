import { createBrowserRouter } from "react-router-dom";
// import React from "react"
import Root from "./Root";
import Home from "./components/Home";
import WorkshopTable from "./components/WorkshopTable";
import Test from "./components/Test";
import Settings from "./components/Settings";
import Article from "./components/Article";


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
        path: "/test",
        element: <Test />,
      }
    ],
  },
]);

export default router;
