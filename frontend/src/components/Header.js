import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css'; // Import your CSS file

function Header() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location]);

    return (
        <nav>
            <Link
                className="item"
                to="/learn"
            >
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
                        <Link to="/dashboard">
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
                        <Link className="logout" to="/logout">
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
    );
}

export default Header;