/**
 * @fileoverview This is the component for the 404 Error page.
 * @author Collin Streitman
 * @created 01.24.2024
 * @lastModified By Collin Streitman on 04.26.2024
 *
 * This page displays when the user tries to go to a route not listed
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000); // 1000 milliseconds = 1 second

    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 5000); // Wait for 4 seconds + 1 second for "Blast Off"

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    }; // Cleanup both timers
  }, [navigate]);

  return (
  <div id='oopss'>
    <div id='error-text'>
      <lord-icon
        src="https://cdn.lordicon.com/usownftb.json"
        trigger="loop"
        delay="1500"
        stroke="bold"
        colors="primary:#111111,secondary:#06c56d"
        style={{ width: '250px', height: '250px' }}>
      </lord-icon>
      <span>Error 404</span>
      <p className="p-a">
        Page not found! Looks like the URL went on a vacation without leaving a 
        forwarding address. Let's hope it's enjoying some sunny beaches and will be 
        back soon!
      </p>
      <p className="p-b">You will be redirected to the homepage.</p>
     <p className="p-c" style={{ position: 'fixed', bottom: '75px', width: '100%', textAlign: 'center' }}>
        {countdown > 0 ? countdown : 'Blast Off'}</p>
      </div>
  </div>
);
  }

export default NotFoundPage;
