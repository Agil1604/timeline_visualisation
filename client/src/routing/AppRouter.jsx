import React from 'react';
import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import { authRoutes, publicRoutes, onlyPublicRoute } from "./router";

import { AuthProvider, useAuth } from '../context/AuthContext';
import { LOGIN_PAGE, WELCOME_PAGE } from './consts';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return user ? <Outlet /> : <Navigate to={LOGIN_PAGE} replace />;
};

const OnlyPublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  return user ? <Navigate to={`/user/${user.nickname}`} replace /> : <Outlet />;
};

export const AppRouter = () => {
    return (
        <AuthProvider>
            <Routes>
                {publicRoutes.map(({ path, component }) => (
                    <Route key={path} path={path} element={component} />
                ))}

                <Route element={<OnlyPublicRoute />}>
                    {onlyPublicRoute.map(({ path, component }) => (
                        <Route key={path} path={path} element={component} />
                    ))}
                </Route>

                <Route element={<PrivateRoute />}>
                    {authRoutes.map(({ path, component }) => (
                        <Route key={path} path={path} element={component} />
                    ))}
                </Route>

                <Route path="*" element={<Navigate to={WELCOME_PAGE} />} />
            </Routes>
        </AuthProvider>
    );
};