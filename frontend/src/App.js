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

  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/travel" element={<Benchmark />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/account" element={<Account />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/preferences" element={<Preferences />} />
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
      {showTopBtn && (
        <button
          className={`back-to-top ${showTopBtn ? 'visible' : ''}`}
          onClick={scrollToTop}
        >
          <lord-icon
              src="https://cdn.lordicon.com/ufkabwzu.json"
              trigger="hover"
              stroke="bold"
              colors="primary:#ffffff"
              style={{ width: '25px', height: '25px' }}>
          </lord-icon>
        </button>
      )}
    </BrowserRouter>
  );
}

export default App;
