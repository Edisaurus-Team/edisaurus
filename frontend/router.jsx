import { createBrowserRouter } from "react-router-dom";
// import React from "react"
import Root from "./Root";
import Home from "./Home";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

export default router;
