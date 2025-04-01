import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "./MainLayout";
import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Profile from "./pages/Profile";

const browserRouter = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/profile/:id",
                element: <Profile />,
            }
        ],
    },
    {
        path: "/auth/signup",
        element: <Signup />,
    },
    {
        path: "/auth/login",
        element: <Login />,
    },
]);

function App() {
    return (
        <div>
            <RouterProvider router={browserRouter} />
        </div>
    );
}

export default App;
