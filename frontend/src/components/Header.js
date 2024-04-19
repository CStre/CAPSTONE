import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Header.css'; // Import your CSS file
import { useAuth } from '../AuthContext';


function Header() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const { setIsAuthenticated } = useAuth();

    const handleLogout = () => {
        // Retrieve CSRF token from cookies; assuming you are using js-cookie
        const csrfToken = Cookies.get('csrftoken')
    
        axios.post(`${API_BASE_URL}/logout/`, {}, {
            headers: {
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => {
            console.log('Logout Successful', response.data);
            setIsAuthenticated(false);
            localStorage.removeItem('userName');
            localStorage.removeItem('userLoggedIn');
            // Redirect to login page or home page
        })
        .catch(error => {
            console.error('Logout Error', error);
        });
    };
    
    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location]);

    return (
        <div className='header'>
        <nav>
            <Link className="item" to="/learn">
                <lord-icon
                    className="item-icon"
                    src="https://cdn.lordicon.com/mrikdaqa.json"
                    trigger="hover"
                    stroke="bold"
                    colors="primary:#ffffff,secondary:#06c56d"
                    style={{ width: '50px', height: '50px' }}
                ></lord-icon>
                Learn
            </Link>
            <Link
                className="item"
                to="/travel"
            >
                <lord-icon
                    className="item-icon"
                    src="https://cdn.lordicon.com/gjhbhscz.json"
                    trigger="hover"
                    stroke="bold"
                    colors="primary:#ffffff,secondary:#06c56d"
                    style={{ width: '50px', height: '50px' }}>
                </lord-icon>
                Travel
            </Link>
            <Link
                className="item"
                to="/credits"
            >
                <lord-icon
                    className="item-icon"
                    src="https://cdn.lordicon.com/gqjpawbc.json"
                    trigger="hover"
                    stroke="bold"
                    state="hover-burst"
                    colors="primary:#ffffff,secondary:#06c56d"
                    style={{ width: '50px', height: '50px' }}
                ></lord-icon>
                Credits
            </Link>
            <div className="item">
                <lord-icon
                    className="item-icon"
                    src="https://cdn.lordicon.com/teofqznt.json"
                    trigger="hover"
                    stroke="bold"
                    colors="primary:#ffffff,secondary:#06c56d"
                    style={{ width: '50px', height: '50px' }}
                ></lord-icon>
                Account
                <div className="dropdown">
                    <div>
                        <Link to="/account">
                            <lord-icon
                                src="https://cdn.lordicon.com/eaexqthn.json"
                                trigger="hover"
                                stroke="bold"
                                colors="primary:#ffffff,secondary:#06c56d"
                                style={{ width: '30px', height: '30px' }}
                            ></lord-icon>
                            Account
                        </Link>
                        <Link to="/dashboard">
                            <lord-icon
                                src="https://cdn.lordicon.com/pbkmxonw.json"
                                trigger="hover"
                                state="morph-unfold"
                                stroke="bold"
                                colors="primary:#ffffff,secondary:#06c56d"
                                style={{ width: '30px', height: '30px' }}
                            ></lord-icon>
                            Dashboard
                        </Link>
                        <Link to="/preferences">
                            <lord-icon
                                src="https://cdn.lordicon.com/kjjbpuhp.json"
                                trigger="hover"
                                stroke="bold"
                                colors="primary:#ffffff,secondary:#06c56d"
                                style={{ width: '30px', height: '30px' }}
                            ></lord-icon>
                            Preferences
                        </Link>
                        <Link className="logout" to="/" onClick={handleLogout}>
                            <lord-icon
                                src="https://cdn.lordicon.com/lbjtvqiv.json"
                                trigger="hover"
                                stroke="bold"
                                colors="primary:#c71f16,secondary:#c71f16"
                                style={{ width: '30px', height: '30px' }}
                            ></lord-icon>
                            Logout
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
        </div>
    );
}

export default Header;