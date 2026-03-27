import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import EmployeeDetail from "./pages/Employeedetail";
import Profile        from "./pages/profile";
import AdminUsers     from "./pages/Adminusers";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />   
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </Router>
  );
}

export default App;
