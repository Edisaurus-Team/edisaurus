import { createBrowserRouter } from "react-router-dom";
// import React from "react"
import Root from "./Root";
import Home from "./components/Home";
import Workshop from "./components/Workshop";


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
        element:<Workshop />,
      }
    ],
  },
]);

export default router;
