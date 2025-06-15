import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "./MainLayout";
import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChatPage from "./pages/ChatPage";
import Notification from "./pages/Notification";
import PeekPost from "./components/posts/PeekPost";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
// import { setSocket } from "./store/slices/socketSlice";
// import { setOnlineUsers } from "./store/slices/chatSlice";
// import { setLikeNotification } from "./store/slices/RTNSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { initializeSocket, closeSocket } from "./utils/socket";
import { setConnectionStatus } from "./store/slices/socketSlice";

const browserRouter = createBrowserRouter([
    {
        path: "/",
        element: (
            <ProtectedRoutes>
                <MainLayout />
            </ProtectedRoutes>
        ),
        children: [
            {
                path: "/",
                element: (
                    <ProtectedRoutes>
                        <Home />
                    </ProtectedRoutes>
                ),
            },
            {
                path: "/profile/:id",
                element: (
                    <ProtectedRoutes>
                        <Profile />
                    </ProtectedRoutes>
                ),
            },
            {
                path: "/account/edit",
                element: (
                    <ProtectedRoutes>
                        <EditProfile />
                    </ProtectedRoutes>
                ),
            },
            {
                path: "/chats",
                element: (
                    <ProtectedRoutes>
                        <ChatPage />
                    </ProtectedRoutes>
                ),
            },
            {
                path: "/notify",
                element: (
                    <ProtectedRoutes>
                        <Notification />
                    </ProtectedRoutes>
                ),
            },
            
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
    {
        path: "/post",
        element: (
            <ProtectedRoutes>
                 <PeekPost />
            </ProtectedRoutes>
        ),
    }
    
]);

function App() {
    const dispatch = useDispatch();
    const { user } = useSelector((store) => store.auth);
    const { isConnected } = useSelector((store) => store.socketio);

    useEffect(() => {
        if (user) {
            // Initialize socket through our utility
            const socket = initializeSocket(user?._id);
            
            // Update connection status
            socket.on('connect', () => {
                dispatch(setConnectionStatus(true));
            });
            
            socket.on('disconnect', () => {
                dispatch(setConnectionStatus(false));
            });
        }

        // Clean up
        return () => {
            closeSocket();
            dispatch(setConnectionStatus(false));
        };
    }, [user, dispatch]);

    return (
        <div>
            <RouterProvider router={browserRouter} />
        </div>
    );
}

export default App;
