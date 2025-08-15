import React, { useEffect, useMemo, useRef, useState } from 'react';
import IonIcon from '@reacticons/ionicons';
import ToggleTheme from '../Components/toggleTheme';
import api from '../Script/api';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { logout } from '../Script/auth';

const SettingPage = () => {
   const [formData, setFormData] = useState({
        username: localStorage.getItem('username') || '' as string,
        email: localStorage.getItem('email') || '' as string,
        avatar: null as File | null
   }); 
   const [formPassword, setFormPassword] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
   })

   
   const navigate = useNavigate();
   useEffect(() => {
     if (!localStorage.getItem('username')) {
          navigate('/login');
        }
    }, []);

  const [avatarPreview, setAvatarPreview] = useState<string | null>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const defaultAvatar = useMemo(() => {
    const avatar = localStorage.getItem('avatar');
    console.log(avatar);
    return avatar ? `${API_BASE_URL}${avatar}` : '/defualt.jpg';
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveForm = async () => {
    if (formData.username === '' || formData.email === '') {
      setError('Заполните все поля');
      return;
    }

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    if (formData.avatar) {
      data.append('avatar', formData.avatar);
    }

    await api.put('/api/profile/', data, {  
      headers: { "Content-Type": "multipart/form-data" },
    }).then(
        res => {   
            setSuccess(res.data.message);
            setError('');
            localStorage.setItem('username', res.data.profile.username);
            localStorage.setItem('email', res.data.profile.email);
            if (res.data.profile.avatar) {
              localStorage.setItem('avatar', res.data.profile.avatar);
            }
        }
    ).catch(err => {
      setSuccess('');
      setError(err.response.data.message);
    });
  };

  const newPassword = async () => {
    if (formPassword.oldPassword === '' || formPassword.newPassword === '' || formPassword.confirmPassword === '') {
        setError('Заполните все поля');
        return;
    } else if (formPassword.newPassword !== formPassword.confirmPassword) {
        setError('Пароли не совпадают');
        return;
    } else if (formPassword.oldPassword === formPassword.newPassword) {
        setError('Новый пароль совпадает со старым');
        return;
    } else if (formPassword.oldPassword.length < 4 || formPassword.newPassword.length < 4 || formPassword.confirmPassword.length < 4) {
        setError('Пароль должен быть не менее 4 символов');
        return;
    } else {
        setError('');
    }

    await api.post('/api/profile/', formPassword).then(res => {
        setSuccess(res.data.message);
        setError('');
        setPasswordVisible(false);
    }).catch(err => {
        setSuccess('');
        setError(err.response.data.message);
    });
  }

  const handleSetData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSetPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormPassword(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="text-base-content flex flex-col w-full min-h-screen bg-base-200 p-4 rounded-2xl">
      <h1 className="text-2xl py-2">Настройки</h1>

      {/* Тема */}
      <div className="flex flex-row items-center gap-2 py-2 md:hidden">
        <span>Тема:</span>
        <ToggleTheme />
      </div>

      {/* Аватар */}
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="avatar items-center">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-primary ring-2 group relative cursor-pointer overflow-hidden"
            onClick={handleAvatarClick}
          >
            <img
              src={avatarPreview || defaultAvatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute opacity-0 top-0 left-0 w-full h-full bg-black group-hover:opacity-60 transition duration-300 flex items-center justify-center">
              <IonIcon name="camera-outline" className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept='image/*'
        />
      </div>

      {/* Логин */}
      <div className="flex flex-col gap-2 py-2 w-full max-w-md mx-auto">
        <label className="floating-label">
          <span>Логин:</span>
          <input
            name='username'
            type="text"
            placeholder="Логин"
            className="input input-bordered w-full input-lg"
            value={formData.username}
            onChange={(e) => handleSetData(e)}
          />
        </label>
      </div>

   
      <div className="flex flex-col gap-2 py-2 w-full max-w-md mx-auto">
        <label className="floating-label">
          <span>Email:</span>
          <input
            name='email'
            type="email"
            placeholder="Email"
            className="input input-bordered w-full input-lg"
            value={formData.email}
            onChange={(e) => handleSetData(e)}
          />
        </label>
      </div>
          {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 py-2 w-full max-w-md mx-auto">
            <button
            className="hover:bg-base-100 text-base-content font-bold py-2 px-4 rounded-xl w-full text-xl"
            onClick={handleSaveForm}
            >
            Сохранить
            </button>
            <button
            className="hover:bg-base-100 font-bold py-2 px-4 rounded-xl text-red-500 w-full text-xl"
            onClick={logout}
            >
            Выйти
            </button>
        </div>
        {passwordVisible ? (
            <div className="flex flex-col gap-4 py-2 w-full max-w-md mx-auto">
                <label className="floating-label">
                <span>Старый пароль:</span>
                <input
                    name='oldPassword'
                    type="password"
                    placeholder="Старый пароль"
                    className="input input-bordered w-full input-lg"
                    value={formPassword.oldPassword}
                    onChange={(e) => handleSetPassword(e)}
                />
                </label>
                <label className="floating-label">
                <span>Новый пароль:</span>
                <input
                    name='newPassword'
                    type="password"
                    placeholder="Новый пароль"
                    className="input input-bordered w-full input-lg"
                    value={formPassword.newPassword}
                    onChange={(e) => handleSetPassword(e)}
                />
                </label>
                <label className="floating-label">
                <span>Подтвердите пароль:</span>
                <input
                    name='confirmPassword'
                    type="password"
                    placeholder="Подтверждение"
                    className="input input-bordered w-full input-lg"
                    value={formPassword.confirmPassword}
                    onChange={(e) => handleSetPassword(e)}
                />
                </label>
                <div className="flex flex-col sm:flex-row gap-4 py-2 w-full max-w-md mx-auto">
                <button
                    className="bg-outline hover:bg-base-100 rounded-xl font-bold py-2 px-4 w-full text-md"
                    onClick={newPassword}
                >
                    Изменить пароль
                </button>
                <button
                    className="hover:bg-base-100 text-red-500 rounded-xl font-bold py-2 px-4 w-full text-md"
                    onClick={() => {
                        setPasswordVisible(false);
                        setError('');
                    }}
                >
                    Отменить
                </button>
                </div>
            </div>
        ) : (
            <div className="flex flex-col gap-2 py-2 w-full max-w-md mx-auto">
                <button className="btn btn-primary" onClick={() => setPasswordVisible(true)}>
                    Изменить пароль
                </button>
            </div>
        )}
        {error && <p className="text-red-500 text-center font-bold">{error}</p>}
        {success && <p className="text-green-500 text-center font-bold">{success}</p>}

    </div>
  );
};

export default SettingPage;
