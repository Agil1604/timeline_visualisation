import { Navigate } from 'react-router-dom';

// Пути к проетам
import { 
  WELCOME_PAGE,
  HOME_PAGE, 
  PROFILE_PAGE,
  LOGIN_PAGE,
  FORGOT_PASSWORD_PAGE,
  REGISTER_PAGE,
  LINEAR_PROJECT_PAGE,
  LINEAR_DATES_PROJECT_PAGE,
  GANTT_PROJECT_PAGE,
  CHRONOLOGY_PROJECT_PAGE
} from './consts'

// Основные страницы
import Welcome from '../pages/WelcomePage/WelcomePage';
import Home from '../pages/HomePage/HomePage';
import Login from '../pages/AuthPages/LoginPage';
import Register from '../pages/AuthPages/RegisterPage';
import ForgotPassword from '../pages/AuthPages/ForgotPasswordPage';

// Страницы профиля
import Profile from '../pages/ProfilePage/ProfilePage';
import Info from '../pages/ProfilePage/ProfileInfo'
import ChangePassword from '../pages/ProfilePage/ProfileChangePassword'
import ChangeUsername from '../pages/ProfilePage/ProfileChangeUsername'
import Delete from '../pages/ProfilePage/ProfileDelete'

// Страницы проекта
import LinearProject from '../pages/LinearProjectPage/LinearProjectPage';
import GanttProject from '../pages/GanttProjectPage/GanttProjectPage';
import ChronologyProject from '../pages/ChronologyProjectPage/ChronologyProjectPage';
import LinearDatesProjectPage from '../pages/LinearDatesProjectPage/LinearDatesProjectPage';

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
    element: <Profile />,
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
    element: <LinearProject />,
  },
  {
    path: GANTT_PROJECT_PAGE,
    element: <GanttProject />,
  },
  {
    path: CHRONOLOGY_PROJECT_PAGE,
    element: <ChronologyProject />
  },
  {
    path: LINEAR_DATES_PROJECT_PAGE,
    element: <LinearDatesProjectPage />
  }
];