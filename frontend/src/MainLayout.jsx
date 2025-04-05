import React from "react";
import SideNav from "./components/SideNav";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <div>
            <SideNav />
            <div className="">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
