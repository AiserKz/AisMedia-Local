import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AppLayout from './Layout/AppLayout'
import DefaultPage from './Pages/DefaultPage'
import AboutPage from './Pages/AboutPage'
import LoginPage from './Pages/LoginPage'
import WatchPage from './Pages/WatchPage'
import ErrorPage from './Pages/ErrorPage'
import AdminPage from './Pages/AdminPage'
import SeriesForm from './Pages/adminHelpPages/Series'
import SettingPage from './Pages/SettingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<AppLayout />}>
          <Route index element={<DefaultPage page={"home"} />} />
          <Route path='about' element={<AboutPage />} />
          <Route path='movies' element={<DefaultPage page={"movies"} />} />
          <Route path='anime' element={<DefaultPage page={"anime"} />} />
          <Route path='other' element={<DefaultPage page={"other"} />} />
          <Route path='cartoons' element={<DefaultPage page={"cartoons"} />} />
          <Route path='login' element={<LoginPage />} />
          <Route path='watch/:id' element={<WatchPage />} />
          <Route path='settings' element={<SettingPage />} />
          <Route path='admin/' element={<AdminPage />} />
          <Route path='admin/series/:id' element={<SeriesForm />} />
          <Route path='*' element={<ErrorPage />} />
        </Route>
      </Routes>

      
    </BrowserRouter>
  )
}

export default App
