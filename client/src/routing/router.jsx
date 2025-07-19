import { HOME_PAGE, LOGIN_PAGE, LINEAR_PROJECT_PAGE, REGISTER_PAGE, WELCOME_PAGE, GANTT_PROJECT_PAGE, PROFILE_PAGE, FORGOT_PASSWORD_PAGE } from './consts'

import Home from '../pages/HomePage/HomePage';
import Welcome from '../pages/WelcomePage/WelcomePage';
import Project from '../pages/LinearProjectPage/LinearProjectPage';
import GanttChart from '../pages/GanttProjectPage/GanttProjectPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import Login from '../pages/AuthPages/LoginPage';
import Register from '../pages/AuthPages/RegisterPage';
import ForgotPassword from '../pages/AuthPages/ForgotPasswordPage';

export const publicRoutes = [
    {
        path: WELCOME_PAGE,
        component: <Welcome />,
    }
]

export const onlyPublicRoute = [
    {
        path: LOGIN_PAGE,
        component: <Login />,
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
        path: LINEAR_PROJECT_PAGE,
        component: <Project />,
    },
    {
        path: GANTT_PROJECT_PAGE,
        component: <GanttChart />,
    },
];