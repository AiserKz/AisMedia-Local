import { useState } from "react"
import login from "../Script/auth";


const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        const status = await login(username, password);
        
        if (status.success) {
            setSuccess(status.message);
            setErrors(null);
            window.location.href = "/";
        } else {
            setErrors(status.message);
            setSuccess(null);
        }
        setLoading(false);
    };
    return (
        <>
            <h2 className="text-xl font-bold text-center mb-2">Вход</h2>
            <div className="flex flex-col gap-3">
                <label htmlFor="username" className="floating-label">
                    <span>Имя пользователя</span>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        className="input input-bordered w-full"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
                <label htmlFor="password" className="floating-label">
                    <span>Пароль</span>
                    <input
                        type="password"
                        placeholder="Пароль"
                        className="input input-bordered w-full"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                </label>
                <button className="btn btn-primary w-full mt-2" onClick={handleSubmit}>Войти</button>
                {errors && <p className="text-error text-center px-4">{errors}</p>}
                {success && <p className="text-success text-center px-4">{success}</p>}
            </div>
        </>
    )
    
}

export default LoginForm