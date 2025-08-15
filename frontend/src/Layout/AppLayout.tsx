
import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "../Components/footer";
import LeftMenu from "../Components/leftMenu";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Header from "../Components/header";

export default function AppLayout() {
    const location = useLocation();

    useEffect(() => {
        NProgress.start();
       const timer = setTimeout(() => {
           NProgress.done();

       }, 200);
       return () => {
           clearTimeout(timer);
       };
    }, [location.pathname]);

    return (
        <div className="drawer lg:drawer-open min-h-screen bg-base-300">
            <div className="drawer-content flex flex-col">
                {/* Header */}
                <div className="mt-4">
                    <h1 className="md:hidden text-3xl font-medium leading-normal text-base-content px-3 pt-5"><Link to="/">Ais|Media</Link><span className="text-xs text-base-content/60">v 1.0</span></h1>
                    <Header />
                </div>
                {/* Основной контент */}
                <main className="flex-1 flex flex-col items-center bg-base-300 px-2 md:pr-5">
                    <Outlet />
                </main>
                {/* Footer */}
                <Footer />
            </div>
            <LeftMenu />

        </div>
    )
}