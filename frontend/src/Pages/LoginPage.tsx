import { useEffect, useState } from "react";
import { checkAuth } from "../Script/auth";
import RegisterForm from "../Components/RegisterForm";
import LoginForm from "../Components/LoginForm";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function check() {
            const isAuth = await checkAuth();
            if (isAuth) {
                navigate("/");
            }
        }
        check();
        setTimeout(() => setLoading(false), 500);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 w-full">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <span className="mt-4 text-base-content/70">Загрузка...</span>
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] items-center bg-base-200 w-full justify-center rounded-xl px-8 ">
            <div className="w-full md:min-w-[300px] max-w-[400px] card bg-base-100 shadow-xl border border-base-300 ">
                <div className="card-body shadow-base shadow-sm">
                    <div className="flex justify-center mb-4">
                        <div className="btn-group">
                            <button
                                className={`btn btn-sm ${mode === "login" ? "btn-primary" : "btn-ghost"}`}
                                onClick={() => setMode("login")}
                            >
                                Вход
                            </button>
                            <button
                                className={`btn btn-sm ${mode === "register" ? "btn-primary" : "btn-ghost"}`}
                                onClick={() => setMode("register")}
                            >
                                Регистрация
                            </button>
                        </div>
                    </div>
                        <div className={`relative min-h-[220px] transition-all duration-300 ease-in-out ${mode === "login" ? 'h-[220px]' : 'h-[300px]' }`}>
                            {/* Форма входа */}
                            <div
                                className={`absolute inset-0 transition-all duration-300 ease-in-out
                                    ${mode === "login" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
                                `}
                            >
                                <LoginForm />
                            </div>
                            {/* Форма регистрации */}
                            <div
                                className={`absolute inset-0 transition-all duration-300 ease-in-out
                                    ${mode === "register" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
                                `}
                            >
                                <RegisterForm />
                            </div>
                        </div>
                   
                </div>
            </div>
        </div>
    );
}