import React, { useState, useEffect } from 'react';
import './PreferencesPage.css';
import Header from '../../components/Header';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '../../AuthContext';

// Import all images individually
import image1 from '../../images/image-1.png';
import image2 from '../../images/image-2.png';
import image3 from '../../images/image-3.png';
import image4 from '../../images/image-4.png';
import image5 from '../../images/image-5.png';
import image6 from '../../images/image-6.png';
import image7 from '../../images/image-7.png';
import image8 from '../../images/image-8.png';
import image9 from '../../images/image-9.png';
import image10 from '../../images/image-10.png';
import image11 from '../../images/image-11.png';
import image12 from '../../images/image-12.png';

import map from '../../images/header.svg';

const images = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10, image11, image12];
const countries = ["Finland", "Norway", "Italy", "Iceland", "USA", "Canada", "Egypt", "China", "Singapore", "Brazil", "Australia", "New Zealand"];
const cities = ["Helsinki", "Oslo", "Rome", "Reykjavik", "New York City", "Vancouver", "Cairo", "Hong Kong", "Singapore", "Rio de Janeiro", "Sydney", "Auckland"];
const icons = ["https://cdn.lordicon.com/pxpdudif.json", "https://cdn.lordicon.com/fbcvnshf.json", "https://cdn.lordicon.com/ixyzzyfp.json",
    "https://cdn.lordicon.com/ueamqcht.json", "https://cdn.lordicon.com/zcyphwhl.json", "https://cdn.lordicon.com/vahppyte.json",
    "https://cdn.lordicon.com/fueliett.json", "https://cdn.lordicon.com/pmasrwnp.json", "https://cdn.lordicon.com/etooplay.json",
    "https://cdn.lordicon.com/drmllbag.json", "https://cdn.lordicon.com/gcmjldaz.json", "https://cdn.lordicon.com/prwfstyf.json"];

function PreferencesPage() {
    const [selections, setSelections] = useState(new Array(12).fill(null));
    const [errorMessage, setErrorMessage] = useState('');
    const [preferencesExist, setPreferencesExist] = useState(false);

    const handleSelectionChange = (index) => {
        setSelections(prev => {
            const newSelections = [...prev];
            newSelections[index] = newSelections[index] === null ? 1 : (newSelections[index] + 1) % 3;
            return newSelections;
        });
    };

    useEffect(() => {
        console.log('Checking for existing user preferences...');
        axios.get('/user-info/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(response => {
            console.log('User info received:', response.data);
            if (response.data.preferences) {
                console.log('Preferences exist:', response.data.preferences);
                setPreferencesExist(true);
            } else {
                console.log('No preferences found.');
            }
        }).catch(error => {
            console.error('Failed to fetch user details:', error);
            setErrorMessage('Failed to fetch preferences. Please refresh the page.');
        });
    }, []);

    const handleSubmit = async () => {
        if (!preferencesExist && selections.every(state => state !== null)) {
            const preferenceArray = selections.map(state => state === 1 ? 1 : 0);
            try {
                const csrfToken = Cookies.get('csrftoken');
                const response = await axios.patch('/user-info/', {
                    preferences: preferenceArray.join(',')
                }, {
                    headers: {
                        'X-CSRFToken': csrfToken
                    }
                });
                alert('Preferences updated successfully!');
            } catch (error) {
                console.error('Failed to update preferences:', error);
                setErrorMessage('Failed to update preferences. Please try again.');
            }
        } else {
            setErrorMessage('Please make a selection for each location before submitting.');
        }
    };
    


    const allSelected = selections.every(state => state !== null);

    // Helper function to generate rows of cards
    const generateCardRows = () => {
        let rows = [];
        for (let i = 0; i < images.length; i += 3) {
            rows.push(
                <div key={i} className="row">
                    {images.slice(i, i + 3).map((image, index) => (
                        <div key={index + i} className="custom-card">
                            <div className="img-box">
                                <img src={image} alt={`${cities[index + i]}, ${countries[index + i]}`} />
                            </div>
                            <div className="custom-content">
                                <h2>{`${cities[index + i]}, ${countries[index + i]}`}</h2>
                                <lord-icon
                                    className="loc"
                                    src={icons[index + i]}
                                    trigger="in"
                                    colors="primary:#121331,secondary:#000000"
                                    style={{ width: '75px', height: '75px' }}
                                ></lord-icon>
                                <p>{cities[index + i]}</p>
                                {!preferencesExist && (
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        handleSelectionChange(index + i);
                                    }} style={{ color: selections[index + i] === 1 ? '#00ff00' : selections[index + i] === 2 ? '#ff0000' : '#808080' }}>
                                        {selections[index + i] === 1 ? (
                                            <lord-icon
                                                src="https://cdn.lordicon.com/ymsapbnv.json"
                                                trigger="in"
                                                stroke="bold"
                                                state="morph-check-appear"
                                                colors="primary:#109121,secondary:#109121"
                                                style={{ width: '40px', height: '40px' }}
                                            ></lord-icon>
                                        ) : selections[index + i] === 2 ? (
                                            <lord-icon
                                                src="https://cdn.lordicon.com/rmkpgtpt.json"
                                                trigger="in"
                                                stroke="bold"
                                                state="morph-error-appear"
                                                colors="primary:#c71f16,secondary:#c71f16"
                                                style={{ width: '40px', height: '40px' }}
                                            ></lord-icon>
                                        ) : "Select"}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return rows;
    };

    return (
        <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
            </head>
            <div>
                <Header />
                <div className='preferences-map'>
                    <img src={map} alt="Header Map" />
                </div>
                <div className="message">
                    Select your Preferences
                </div>
                <div>
                    <p>You may only select these proferences once.</p>
                </div>
                <div className='preferencesPage'>
                    <div className="container">
                        {generateCardRows()}
                        {!preferencesExist && (
                            <button onClick={handleSubmit} className="submit-btn">
                                Submit Preferences
                            </button>
                        )}
                        {preferencesExist && (
                            <p className="error-message">You have already selected your account preferences. Logout or delete your current account on the account page and sign up with a new account to reselect preferences.</p>
                        )}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </div>
                </div>
            </div>
        </html>
    );
}

export default PreferencesPage;
