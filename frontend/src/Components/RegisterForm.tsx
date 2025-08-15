import { useState } from "react"
import { register, validateUser } from "../Script/auth";


const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        var valid = validateUser(username, password, confirmPassword);
        if (!valid.success) {
            setErrors(valid.message);
            return;
        } else {
            setErrors(null);
        }

        const res = await register(username, password, email);
        
        if (res.success === true) {
            setSuccess(`Добро пожаловать, ${res.username}!`);
            setErrors(null);
            window.location.href = "/";
        } else {
            setErrors("Произошла ошибка при регистрации");
            setSuccess(null);
        }
        setLoading(false);
    };

    return (
        <>
            <h2 className="text-xl font-bold text-center mb-2">Регистрация</h2>
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
                <label htmlFor="email" className="floating-label">
                    <span>Email</span>
                    <input
                        type="email"
                        placeholder="Email"
                        className="input input-bordered w-full"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                </label>
                <label htmlFor="password" className="floating-label">
                    <span>Пароль</span>
                    <input
                        type="password"
                        placeholder="Пароль"
                        className="input input-bordered w-full"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                </label>
                <label htmlFor="confirm-password" className="floating-label">
                    <span>Повторите пароль</span>
                    <input
                        type="password"
                        placeholder="Повторите пароль"
                        className="input input-bordered w-full"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                </label>
                <button className="btn btn-primary w-full mt-2" onClick={handleSubmit}>Зарегистрироваться</button>
                {errors && <p className="text-red-500 text-center">{errors}</p>}
                {success && <p className="text-green-500 text-center">{success}</p>}
            </div>
        </>
    )
}

export default RegisterForm