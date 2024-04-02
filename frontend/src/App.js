import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import axios from 'axios';
import BASE_URL from './config'; // Importing BASE_URL from your config

import lottie from 'lottie-web';
import { defineElement } from '@lordicon/element';

import Home from "./pages/HomePage/HomePage";
import Learn from "./pages/LearnPage/LearnPage";
import Benchmark from "./pages/BenchmarkPage/BenchmarkPage";
import Credits from "./pages/CreditsPage/CreditsPage";

import Account from "./pages/AccountPage/AccountPage";
import Dashboard from "./pages/DashboardPage/DashboardPage";
import Preferences from "./pages/PreferencesPage/PreferencesPage";

import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

// Define "lord-icon" custom element with default properties
defineElement(lottie.loadAnimation);

function App() {
  const [setData] = useState('');

  useEffect(() => {
    axios.get(`${BASE_URL}/api/test`)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/prototype" element={<Benchmark />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/account" element={<Account />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
