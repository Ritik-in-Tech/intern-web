// src/components/PrivateRoute.tsx
import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const authToken = localStorage.getItem("authToken");

  return authToken ? <>{children}</> : <Navigate to="/admin/login" />;
};

export default PrivateRoute;
