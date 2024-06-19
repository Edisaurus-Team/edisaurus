import { createBrowserRouter } from "react-router-dom";
// import React from "react"
import Root from "./Root";
import Home from "./components/Home";
import Workshop from "./components/Workshop";
import Test from "./components/Test";
import Settings from "./components/Settings";


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
        element: <Workshop />,
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
