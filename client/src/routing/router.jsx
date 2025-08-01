import { HOME_PAGE, LOGIN_PAGE, LINEAR_PROJECT_PAGE, REGISTER_PAGE, WELCOME_PAGE, GANTT_PROJECT_PAGE, PROFILE_PAGE, FORGOT_PASSWORD_PAGE } from './consts'

import Home from '../pages/HomePage/HomePage';
import Welcome from '../pages/WelcomePage/WelcomePage';
import Project from '../pages/LinearProjectPage/LinearProjectPage';
import GanttChart from '../pages/GanttProjectPage/GanttProjectPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import Login from '../pages/AuthPages/LoginPage';
import Register from '../pages/AuthPages/RegisterPage';
import ForgotPassword from '../pages/AuthPages/ForgotPasswordPage';

import Info from '../pages/ProfilePage/ProfileInfo'
import ChangePassword from '../pages/ProfilePage/ProfileChangePassword'
import ChangeUsername from '../pages/ProfilePage/ProfileChangeUsername'
import Delete from '../pages/ProfilePage/ProfileDelete'

import { Navigate } from 'react-router-dom';

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
        element: <Home />,
    },
    {
        path: PROFILE_PAGE,
        element: <ProfilePage />,
        children: [
            {
                index: true,
                element: <Navigate to="info" replace />,
            },
            {
                path: "info",
                element: <Info />,
            },
            {
                path: "change-password",
                element: <ChangePassword />,
            },
            {
                path: "change-username",
                element: <ChangeUsername />,
            },
            {
                path: "delete",
                element: <Delete />,
            },
        ]
    },
    {
        path: LINEAR_PROJECT_PAGE,
        element: <Project />,
    },
    {
        path: GANTT_PROJECT_PAGE,
        element: <GanttChart />,
    },
];