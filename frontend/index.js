import React from "react";
import ReactDOM from "react-dom/client";

import router from "./router.jsx";
import { RouterProvider } from "react-router-dom";

import './css/styles.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
