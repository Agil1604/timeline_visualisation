import React from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import { authRoutes, publicRoutes } from "./router";
import { AuthProvider } from '../context/AuthContext';

import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOGIN_PAGE, WELCOME_PAGE } from './consts';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return user ? <Outlet /> : <Navigate to={LOGIN_PAGE} replace />;
};


export const AppRouter = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<PrivateRoute />}>
                    {authRoutes.map(({ path, component }) => (
                        <Route key={path} path={path} element={component} />
                    ))}
                </Route>

                {publicRoutes.map(({ path, component }) => (
                    <Route key={path} path={path} element={component} />
                ))}

                <Route path="*" element={<Navigate to={WELCOME_PAGE} />} />
            </Routes>
        </AuthProvider>
    );
};