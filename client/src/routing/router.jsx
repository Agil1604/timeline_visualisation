import { HOME_PAGE, LOGIN_PAGE, PROJET_PAGE, REGISTER_PAGE, WELCOME_PAGE, GANTT_PAGE, PROFILE_PAGE, FORGOT_PASSWORD_PAGE } from './consts'

import Home from '../pages/HomePage/HomePage';
import Login from '../pages/LoginPage/LoginPage';
import Welcome from '../pages/WelcomePage/WelcomePage';
import Project from '../pages/LinearProjectPage/LinearProjectPage';
import Register from '../pages/RegisterPage/RegisterPage';
import GanttChart from '../pages/GanttProjectPage/GanttProjectPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import ForgotPassword from '../pages/ForgotPasswordPage/ForgotPasswordPage';

export const publicRoutes = [
    {
        path: LOGIN_PAGE,
        component: <Login />,
    },
    {
        path: WELCOME_PAGE,
        component: <Welcome />,
    },
    {
        path: REGISTER_PAGE,
        component: <Register />,
    },
    {
        path: FORGOT_PASSWORD_PAGE,
        component: <ForgotPassword />,
    }
]

export const authRoutes = [
    {
        path: HOME_PAGE,
        component: <Home />,
    }, 
    {
        path: PROFILE_PAGE,
        component: <ProfilePage />,
    },
    {
        path: PROJET_PAGE,
        component: <Project />,
    },
    {
        path: GANTT_PAGE,
        component: <GanttChart />,
    },
];