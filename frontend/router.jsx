import { createBrowserRouter } from "react-router-dom";
// import React from "react"
import Root from "./Root";
import Home from "./components/Home";
import Test from "./components/Test";


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
