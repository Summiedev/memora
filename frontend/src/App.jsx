import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";

import Register from './pages/Register';
import Login from './pages/Login';
import CapsulesListPage from './pages/CapsulesListPage';
import Dashboard from "./pages/Dashboard";
import ProfileSettingsPage from "./pages/Profile_Settings";
import NotFound from "./pages/404_Page";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/PasswordChange";
import MemoriesListPage from "./pages/MemoriesPageList";
import FriendsPage from "./pages/FriendsPage";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ResetConfirmation from "./pages/ResretConfirmation";

function App() {
  function TokenHandler() {
  const { search, pathname } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.has("token")) {
      params.delete("token");
      window.history.replaceState({}, document.title, pathname + (params.toString() ? `?${params}` : ""));
    }
  }, [search, pathname]);

  return null;
}



  return (

    
    <Router>
      <TokenHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
       
  
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/capsules" element={<CapsulesListPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<ProfileSettingsPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/memories" element={<MemoriesListPage />} />
         <Route path="/friends" element={<FriendsPage />} />
         <Route path="/reset-confirmation" element={<ResetConfirmation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

    </Router>
  );
}

export default App;
