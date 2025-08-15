import axios from "axios";
import api from "./api";
import { API_BASE_URL } from "../config";

const login = async (username: string, password: string) => {
    let status = {
        success: true,
        message: ""
    };
    
    try {
        const res = await axios.post(API_BASE_URL + "/api/token/", {
            username,
            password
        });
        console.log(res.data);
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        localStorage.setItem("username", username);
        status.message = "Авторизация прошла успешно";
        return status
    } catch (err: any) {
        status.success = false;
        status.message = "Неправильное имя пользователя или пароль";
        return status
    }
};

const getUser = async () => {
    api.post("/api/me/").then(res => console.log("Текущий пользователь:", res.data.profile.username));
}

const register = async (username: string, password: string, email: string) => {
    try {
        const res = await axios.post( API_BASE_URL + "/api/register/", {
            username,
            password,
            email
        });
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        return { success: true, message: "Регистрация прошла успешно", username: res.data.username };
    } catch (err: any)  {
        if (err.response) {
            console.error("Ошибка регистрации:", err.response.data);
            return { success: false, message: err.response.data, username: null };
        }
        return { success: false, errors: { detail: "Сервер недоступен" } };
    }
}

const logout = async () => {
    const storageKeys = ["access", "refresh", "username", "level", "can_stream", "can_dowload", 'avatar', 'email'];
    storageKeys.forEach(key => localStorage.removeItem(key));
    window.location.href = "/";
}

const getuser = async () => {
    const user = {
        username: localStorage.getItem("username") || null,
        level: localStorage.getItem("level") || 1,
        can_stream: localStorage.getItem("can_stream") || false,
        can_dowload: localStorage.getItem("can_dowload") || false
    }
    return user
}

const checkAuth = async () => {
    const API_URL = API_BASE_URL + "/api/me/";
    const storageKeys = ["username", "level", "can_stream", "can_dowload", "avatar", "email"];

    const token = localStorage.getItem("access");
    if (!token) return false;
    

    try {
        const res = await api.post(API_URL, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const profile = res.data.profile;
        localStorage.setItem("username", profile.username);
        localStorage.setItem("email", profile.email);
        localStorage.setItem("level", profile.level);
        localStorage.setItem("can_stream", profile.can_stream);
        localStorage.setItem("can_dowload", profile.can_dowload);
        localStorage.setItem("avatar", profile.avatar);
        return true;

    } catch (err: any) {
        storageKeys.forEach(key => localStorage.removeItem(key));
        return false;
    }
}   

const validateUser = (username: string, password: string, confirmPassword: string) => {
    let status = {
        success: true,
        message: ""
    };

    if ( username == "" || password == "" || confirmPassword == "") {
        status.success = false;
        status.message = "Заполните все обязательные поля";
        return status
    }
    if (password !== confirmPassword) {
        status.success = false;
        status.message = "Пароли не совпадают";
        return status
    } else if (username.length < 2 || username.length > 20 ) {
        status.success = false;
        status.message = "Длина логина должна быть от 2 до 20 символов";
        return status
    } else if (password.length < 3) {
        status.success = false;
        status.message = "Длина пароля должна быть не менее 3 символов";
        return status
    }
    return status
};
export { register, validateUser, getUser, checkAuth, logout, getuser };
export default login