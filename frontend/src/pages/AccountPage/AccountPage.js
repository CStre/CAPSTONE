/**
 * @fileoverview This is the componenet for modifying account information
 * @author Collin Streitman
 * @created 01.24.2024
 * @lastModified By Collin Streitman on 04.26.2024
 *
 * This is a dynamically displaying component based on if the user logged in or not. Each time
 * the user modifies any details, they are automatically logged out to log back in so that the
 * cookie tokenizing is preserved. This is also an informational pop-out regarding password data
 * management in Django and bit hashing
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AccountPage.css';
import Cookies from 'js-cookie';
import { useAuth } from '../../AuthContext';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';

function AccountPage() {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [passwordStrength, setPasswordStrength] = useState("");
    const { setIsAuthenticated } = useAuth();
    const navigate = useNavigate();


    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true); 

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const [user, setUser] = useState({
        name: "",
        username: "",
        password: ""
    });

    function Modal({ show, onClose, children }) {
        if (!show) {
            return null;
        }

        return (
            <div className="modal-backdrop">
                <div className="modal-content">
                    <div className="modal-close-icon">
                        <lord-icon
                            src="https://cdn.lordicon.com/rmkpgtpt.json"
                            trigger="hover"
                            stroke="bold"
                            colors="primary:#545454,secondary:#545454"
                            style={{ width: '50px', height: '50px' }}
                            onClick={onClose}>
                        </lord-icon>
                    </div>
                    <div></div>
                    {children}
                </div>
            </div>
        );
    }



    const getToken = () => localStorage.getItem('token');
    const strengthLabels = ["weak", "medium", "medium", "strong"];

    const getStrength = (password) => {
        let strengthIndicator = -1;

        if (/[a-z]/.test(password)) strengthIndicator++;
        if (/[A-Z]/.test(password)) strengthIndicator++;
        if (/\d/.test(password)) strengthIndicator++;
        if (/[^a-zA-Z0-9]/.test(password)) strengthIndicator++;

        if (password.length >= 16) strengthIndicator++;

        return strengthLabels[strengthIndicator];
    };

    const handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        setPasswordStrength(getStrength(newPassword));
        // Set the password in the form's state or handle it as required
        // e.g., setPassword(newPassword);
    };

    useEffect(() => {
        axios.get(`${API_BASE_URL}/user-info/`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(response => {
            console.log("User:", response.data)
            setUser(response.data);
            setLoading(false);
        }).catch(error => {
            console.error('Failed to fetch user info:', error);
            setLoading(false); 
        });
    }, [API_BASE_URL]);

    const handleLogout = async () => {
        const csrfToken = Cookies.get('csrftoken');
        try {
            const response = await axios.post(`${API_BASE_URL}/logout/`, {}, {
                headers: {
                    'X-CSRFToken': csrfToken
                }
            });
            console.log('Logout Successful', response.data);
            setIsAuthenticated(false);
            localStorage.removeItem('userName');
            localStorage.removeItem('userLoggedIn');
            // Redirect to login page or home page
            window.location.href = '/'; // Adjust the path as needed
        } catch (error) {
            console.error('Logout Error', error);
            alert('Failed to logout. Please try again.');
        }
    };

    const handleUpdate = async (field, value) => {
        const data = { [field]: value };
        const csrfToken = Cookies.get('csrftoken');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            'X-CSRFToken': csrfToken
        };

        try {
            const response = await axios.patch(`${API_BASE_URL}/user-info/`, data, { headers });
            if (response.status === 200) {
                setUser(prevState => ({ ...prevState, [field]: value }));
                alert(`${field} updated successfully!`);
                await handleLogout();  // Ensure logout completes
            }
        } catch (error) {
            console.error(`Failed to update ${field}:`, error);
            alert(`Failed to update ${field}. Please try again.`);
        }
    };

    const handleDeleteAccount = async () => {
        const csrfToken = Cookies.get('csrftoken');
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmDelete) {
            try {
                const response = await axios.delete(`${API_BASE_URL}/delete-account/`, {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'X-CSRFToken': csrfToken
                    }
                });
                if (response.status === 204) {
                    alert('Account deleted successfully.');
                    // Logout the user after account deletion
                    handleLogout();
                }
            } catch (error) {
                console.error('Failed to delete account:', error);
                alert('Failed to delete account. Please try again.');
            }
        }
    };

    const handleSelectPreferences = () => {
        navigate('/');
    };

    if (loading) {
        return <Loader />;
    }

    if (user.name === '') {
        return (
            <div>
                <Header />
                <div className="dashboard">
                    <div className="no-preferences">
                        <lord-icon
                            src="https://cdn.lordicon.com/usownftb.json"
                            trigger="in"
                            stroke="bold"
                            state="in-reveal"
                            colors="primary:#ffffff,secondary:#c71f16"
                            style={{ width: '150px', height: '150px' }}>
                        </lord-icon>
                        <div className='no-pref-mess'>
                            <p>You must login before viewing the accounts page.</p>
                        </div>
                        <button onClick={handleSelectPreferences} className="route-button">Login</button>
                    </div>
                </div>
            </div>
        );
    }


        return (
            <div className="accountPage">
                <Header />
                <div className="section">
                    <div className="container">
                        <div className="section.text-center">
                            <label htmlFor="reg-log-2">
                                <lord-icon className="mb-4 pb-3"
                                    src="https://cdn.lordicon.com/pwpcutcz.json"
                                    trigger="hover"
                                    stroke="bold"
                                    style={{ width: '100px', height: '100px' }}
                                    colors="primary:#c4c3ca,secondary:#00e6ff">
                                </lord-icon>
                                <h4 className="mb-4 pb-3">Account Details</h4>
                                <h5 className="mb-4 pb-3">You will have to log back in after changing for security</h5>
                            </label>
                            <div className="userInfo">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-style"
                                        placeholder="Change name"
                                        name="name"
                                        id="name"
                                        defaultValue=""
                                    />
                                    <button className="btn" onClick={() => handleUpdate('name', document.getElementById('name').value)}>Update Name</button>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        className="form-style"
                                        placeholder="Change email"
                                        name="username"
                                        id="username"
                                        defaultValue=""
                                    />
                                    <button className="btn" onClick={() => handleUpdate('username', document.getElementById('username').value)}>Update Email</button>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="password"
                                        className="form-style"
                                        placeholder="Change password"
                                        name="password"
                                        id="password"
                                        defaultValue=""
                                        onChange={handlePasswordChange}
                                    />
                                    <button className="btn" onClick={() => handleUpdate('password', document.getElementById('password').value)}>Update Password</button>
                                </div>
                                <div className="form-group-bar">
                                    <div className={`bars ${passwordStrength}`}>
                                        <div></div>
                                    </div>
                                </div>
                                <div className="form-group-bar">
                                    <div className="strength">
                                        {passwordStrength && `${passwordStrength} password`}
                                    </div>
                                    <i className="input-icon uil uil-lock-alt"></i>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
                        </div>
                        <h7 className="mb-4 pb-3">
                            You can learn more about the security features<span onClick={handleShowModal} className="span-link">here</span>.
                        </h7>
                        {showModal && (
                            <Modal show={showModal} onClose={handleCloseModal}>
                                <div className="modal-icon">
                                    <lord-icon
                                        src="https://cdn.lordicon.com/eaexqthn.json"
                                        trigger="hover"
                                        colors="primary:#545454,secondary:#e83a30"
                                        style={{ width: '150px', height: '150px' }}>
                                    </lord-icon>
                                </div>
                                <p><strong>Password Encryption:</strong> We use SHA-256, a secure hash algorithm, for password hashing. SHA-256 is part of the SHA-2 family of cryptographic hash functions designed by the National Security Agency (NSA). This method produces a unique 256-bit (32-byte) signature for each password. When you create a password, it is immediately hashed using this algorithm before it is stored in our database. This means that your actual password is never stored or viewed by anyone, enhancing the security of your personal information.</p>
                                <p><strong>How This Protects You:</strong> Hashing passwords with SHA-256 ensures that even in the unlikely event of a data breach, the actual passwords remain encrypted and inaccessible. Attackers cannot reverse-engineer these hashes due to the cryptographic strength of SHA-256, providing an additional layer of security for your data.</p>
                                <p><strong>Continual Security Updates:</strong> We continuously monitor and update our security protocols to ensure the integrity and confidentiality of your data. We adhere to industry best practices and guidelines to prevent unauthorized access and potential security threats.</p>
                            </Modal>

                        )}
                    </div>
                </div>
            </div>
        );
    }


export default AccountPage;
