import React, { useState, useEffect } from 'react';
import './PreferencesPage.css';
import Header from '../../components/Header';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '../../AuthContext';
import Loader from '../../components/Loader';
import { useNavigate } from 'react-router-dom';

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
    const [loading, setLoading] = useState(true);  // State to manage loading

    const handleSelectionChange = (index) => {
        setSelections(prev => {
            const newSelections = [...prev];
            newSelections[index] = newSelections[index] === 1 ? 2 : 1;
            return newSelections;
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
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
            setErrorMessage('Failed to fetch preferences. Please refresh the page and make sure you are logged in.');
        });
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async () => {
        if (!preferencesExist && selections.every(state => state !== null)) {
            // Map selections to the new preference values: 50 for like and 5 for dislike
            console.log("Selections:", selections);
            const preferenceArray = selections.map(state => {
                if (state === 1) return 50; // Liked
                if (state === 2) return 5;  // Disliked
                return 0;                  // Handle the case where state may be null or undefined
            });
            console.log("Array to send:", preferenceArray);
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
                setPreferencesExist(true); // Update state to reflect that preferences are now set
            } catch (error) {
                console.error('Failed to update preferences:', error);
                setErrorMessage('Failed to update preferences. Please try again.');
            }
        } else {
            setErrorMessage('Please make a selection for each location before submitting.');
        }
    };
    
    
    const getButtonClass = (state) => {
        switch(state) {
            case 1: return "like";
            case 2: return "dislike";
            default: return "";
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
                                    }} className={`select-button ${getButtonClass(selections[index + i])}`}
                                    style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        {selections[index + i] === 1 ? (
                                            <div className='icon-click'>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/ymsapbnv.json"
                                                trigger="in"
                                                stroke="bold"
                                                state="morph-check-appear"
                                                colors="primary:#109121,secondary:#109121"
                                                style={{ width: '40px', height: '40px' }}
                                            ></lord-icon>
                                            </div>
                                        ) : selections[index + i] === 2 ? (
                                            <div className='icon-click'>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/rmkpgtpt.json"
                                                trigger="in"
                                                stroke="bold"
                                                state="morph-error-appear"
                                                colors="primary:#c71f16,secondary:#c71f16"
                                                style={{ width: '40px', height: '40px' }}
                                            ></lord-icon>
                                            </div>
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

    if (loading) {
        return <Loader />;
    }

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
                <div className="preferences-message">
                    Select your Preferences
                
                <div className='note'>
                    <p>You may only select these proferences once.</p>
                </div>
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
