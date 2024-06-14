import { createBrowserRouter } from "react-router-dom";
// import React from "react"
import Root from "./Root";
import Home from "./Home";
import Test from "./Test";


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
        path: "/test",
        element:<Test />,
      }
    ],
  },
]);

export default router;
