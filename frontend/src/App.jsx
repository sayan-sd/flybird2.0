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
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { setSocket } from "./store/slices/socketSlice";
import { setOnlineUsers } from "./store/slices/chatSlice";
import { setLikeNotification } from "./store/slices/RTNSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";

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
]);

function App() {
    const dispatch = useDispatch();

    const { user } = useSelector((store) => store.auth);
    const { socket } = useSelector((store) => store.socketio);

    useEffect(() => {
        if (user) {
            const socketio = io(import.meta.env.VITE_SOCKET_SERVER_DOMAIN, {
                query: {
                    userId: user?._id,
                },
                transports: ["websocket"],
            });
            dispatch(setSocket(socketio));

            // ====== listen to events ======
            // get list of online users
            socketio.on("getOnlineUsers", (onlineUsers) => {
                dispatch(setOnlineUsers(onlineUsers));
            });

            // notification
            socketio.on("notification", (notification) => {
                // console.log(notification);
                dispatch(setLikeNotification(notification));
            });
        }

        // clean up if no user
        return () => {
            if (socket) {
                socket.close();
                dispatch(setSocket(null));
            }
        };
    }, [user, dispatch]);

    return (
        <div>
            <RouterProvider router={browserRouter} />
        </div>
    );
}

export default App;
