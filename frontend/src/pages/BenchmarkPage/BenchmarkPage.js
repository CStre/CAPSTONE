import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/Header';
import gsap from "gsap";
import { Helmet } from 'react-helmet';
import ScrollTrigger from "gsap/ScrollTrigger";
import App from '../../App';
import './BenchmarkPage.css';
import image1 from '../../images/image-1.svg';
import image2 from '../../images/image-2.svg';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';

function BenchmarkPage() {
    const [boxImages, setBoxImages] = useState([]);
    const [userPreferences, setUserPreferences] = useState([]);
    const navigate = useNavigate();
    const [fetchCount, setFetchCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ name: '' });

    const totalImages = 30; // Assuming there are 30 images
    const imagesPerBatch = 8; // Number of images to display per batch

    const [boxCount, setBoxCount] = useState(8);
    const [boxStates, setBoxStates] = useState(Array(totalImages).fill(0)); // Track the state of each box
    const [isManualScroll, setIsManualScroll] = useState(false);  // State variable
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [errorMessage, setErrorMessage] = useState('');

    const [currentIndex, setCurrentIndex] = useState(0); // Track the index of the current image batch
    const initBoxStates = (numImages) => Array(numImages).fill(2); // 2 signifies unclicked
    const [currentMessage, setCurrentMessage] = useState(0);
    const [showMessage, setShowMessage] = useState(false);

    const [selections, setSelections] = useState(0);

    const [showFirstArrow, setShowFirstArrow] = useState(false);
    const [showSecondArrow, setShowSecondArrow] = useState(false);

    const [image2Visible, setImage2Visible] = useState(false);

    const image1Ref = useRef(null);
    const image2Ref = useRef(null);
    const boxesRef = useRef(null);

    const messages = [
        "Welcome to Travel.",
        "Click once,\nif you like the image.",
        "Double click,\nif you do not.",
        "Check on the Dashboard,\nto see preferences change.",
        "Be mindful of the usage limits.\nHappy Traveling!"
    ];

    const icons = [
        "https://cdn.lordicon.com/krcdqsgu.json", // Icon for Welcome
        "https://cdn.lordicon.com/eugtboiv.json", // Icon for Click once
        "https://cdn.lordicon.com/uxtltfnu.json", // Icon for Double click
        "https://cdn.lordicon.com/dphmlncq.json", // Icon for Dashboard check
        "https://cdn.lordicon.com/faplmdgg.json"  // Icon for Usage limits
    ];

    useEffect(() => {
        console.log('Checking for existing user preferences...');
        axios.get(`${API_BASE_URL}/user-info/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(response => {
            if (response.data.preferences) {
                const preferencesArray = response.data.preferences.split(',').map(item => parseInt(item, 10)).filter(item => !isNaN(item));
                setUserPreferences(preferencesArray);
                setUser({ name: response.data.name });
                console.log('User preferences fetched:', preferencesArray);
                if (fetchCount < 4) {
                    fetchImages(preferencesArray);
                }
                setLoading(false);
            } else {
                console.error('No preferences found.');
                setErrorMessage('Navigate to the user preferences page before continuing.');
                setLoading(false);
            }
        }).catch(error => {
            console.error('Failed to fetch user details:', error);
            setErrorMessage('Failed to fetch preferences. Please refresh the page.');
            setLoading(false);
        });
    }, [API_BASE_URL]);




    const fetchImages = useCallback(async (preferences) => {
        if (fetchCount >= 4) {
            alert('Usage limit reached.');
            return;
        }
        else {
            console.log('Current Limit:', fetchCount);
            console.log('Fetching images with:', preferences);
            const csrfToken = Cookies.get('csrftoken');
            try {
                const response = await axios.post(`${API_BASE_URL}/api/get-images/`, { preferences }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'X-CSRFToken': csrfToken
                    }
                });
                console.log('API response for images:', response.data);
                if (response.data && response.data.images) {
                    const validImages = response.data.images.filter(image => typeof image === 'string' && image.includes(':'));
                    const parsedImages = validImages.map(image => {
                        const [index, ...restOfUrl] = image.split(':');
                        const imageUrl = restOfUrl.join(':');
                        return { index: parseInt(index, 10), imageUrl };
                    });
                    setBoxImages(parsedImages);
                    setBoxStates(Array(parsedImages.length).fill(2)); // Reset states to 2 whenever new images are fetched   
                } else {
                    console.log('No images or invalid data format received:', response.data);
                }
            } catch (error) {
                console.error('Failed to fetch images:', error);
                setErrorMessage('Failed to load new images. Please try again.');
            } finally {
                console.log('Incrementing count');
                setFetchCount(prevCount => prevCount + 1);
            }
        }
    }, [API_BASE_URL, fetchCount]);







    const scrollToElement = (ref, offset = 0) => {
        const topPosition = ref.current.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: topPosition, behavior: 'smooth' });
    };

    // Scroll functions for icons
    const scrollToImage2 = () => {
        setImage2Visible(true); // Set the image2Visible state to true
        scrollToElement(image2Ref, -150);
    };

    const scrollToBoxes = () => scrollToElement(boxesRef, 0);

    const disableObserverAndScroll = (ref, offset) => {
        setIsManualScroll(true);
        const topPosition = ref.current.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: topPosition, behavior: 'smooth' });
        setTimeout(() => setIsManualScroll(false), 1000); // Re-enable after 1 second
    };

    // Function to toggle the state of a box
    const toggleBoxState = (index) => {
        setBoxStates(currentStates => {
            const newStates = [...currentStates];
            if (newStates[index] === 2) { // If unclicked, set to liked
                newStates[index] = 1;
            } else { // Toggle between liked and disliked
                newStates[index] = 1 - newStates[index];
            }
            return newStates;
        });
    };



    const addMoreBoxes = () => {
        // Only add more boxes if all current boxes have been clicked at least once
        const allClickedAtLeastOnce = boxStates.slice(0, boxCount).every(state => state > 0);

        if (allClickedAtLeastOnce && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            setBoxCount(prevCount => Math.min(prevCount + 8, boxImages.length));  // Increase box count but do not exceed the number of available images
        }
    }

    const handleSubmit = async () => {
        console.log('Current User Preferences before submission:', userPreferences);

        const feedbackData = boxStates.map((state, index) => {
            if (state === 0 || state === 1) { // Only consider liked (1) or disliked (0) states
                return `${state}:${boxImages[index].index}`;
            }
            return null;
        }).filter(entry => entry != null);

        console.log('Formatted Feedback Data from user interactions:', feedbackData);

        if (feedbackData.length === 0) {
            console.error('No valid interactions to submit');
            return; // Prevents submission if no valid interactions
        }

        const formattedUserPreferences = userPreferences.map(pref => pref.toString());
        const combinedPreferences = [...formattedUserPreferences, ...feedbackData];
        console.log('Combined preferences to be sent:', combinedPreferences);

        const csrfToken = Cookies.get('csrftoken');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/process-interactions/`, { preferences: combinedPreferences }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-CSRFToken': csrfToken
                }
            });
            const updatedPreferences = response.data.updated_preferences;
            console.log('Retrieved Updated Preferences from Backend:', updatedPreferences);

            // Handle different types of responses
            const newPreferences = updatedPreferences.map(pref => {
                if (typeof pref === 'string' && pref.includes(':')) {
                    return parseFloat(pref.split(':')[1]); // Handle "0:0.95" format
                }
                return parseFloat(pref); // Handle direct number format
            });

            setUserPreferences(newPreferences);

            // Update user preferences to database
            updatePreferencesInDatabase(newPreferences);
            console.log('Updated User Preferences:', newPreferences);

            // Fetch new images based on updated preferences
            console.log('Fetching next Images!');
            fetchImages(newPreferences);
        } catch (error) {
            console.error('Failed to submit interactions:', error);
            setErrorMessage('Failed to update preferences. Please try again.');
        }
    };

    const updatePreferencesInDatabase = async (preferences) => {
        try {
            const csrfToken = Cookies.get('csrftoken');
            const preferencesString = preferences.join(','); // Convert array to comma-separated string
            const response = await axios.patch(`${API_BASE_URL}/user-info/`, {
                preferences: preferencesString // Send this string in the request
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-CSRFToken': csrfToken
                }
            });

            console.log('Database updated successfully:', response.data);
        } catch (error) {
            console.error('Failed to update preferences in the database:', error);
            throw new Error('Failed to update preferences in the database');
        }
    };




    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFirstArrow(true);
        }, 3000); // 3 seconds after initial scroll

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const predefinedScrollPoint = image1Ref;
        const offset = -250; // Set your desired offset here

        // Adding a slight delay to ensure the DOM is fully loaded
        setTimeout(() => {
            scrollToElement(predefinedScrollPoint, offset);
        }, 100); // Delay of 100 milliseconds
    }, []);

    useEffect(() => {
        // Check if it's not the last message
        if (currentMessage < messages.length - 1 && image2Visible == true) {
            setShowSecondArrow(false); // Ensure the second arrow is not shown prematurely
            setShowMessage(true); // Show current message
            const timer = setTimeout(() => {
                setShowMessage(false); // Hide the message after 3 seconds
                const timeout = setTimeout(() => {
                    setCurrentMessage(currentMessage + 1); // Set next message
                }, 500); // Short delay before updating to the next message
                return () => clearTimeout(timeout);
            }, 3000);
            return () => clearTimeout(timer);
        } else if (currentMessage === messages.length - 1) {
            // This is the last message
            setShowMessage(true); // Always show the last message
            setShowSecondArrow(true); // Indicate that we are at the last message and show the arrow
        }
    }, [currentMessage, messages.length, image2Visible]);


    // Rendering boxes with images
    const renderBoxes = () => {
        console.log('Rendering boxes with images:', boxImages);
        return boxImages.map((boxImage, index) => {
            // Determine the class based on the state
            let boxClass = '';
            if (boxStates[index] === 1) {
                boxClass = 'green'; // Liked
            } else if (boxStates[index] === 0) {
                boxClass = 'red'; // Disliked
            } // No class for unclicked (state 2), or you can add a specific class if needed

            return (
                <div key={index} className={`box ${boxClass}`}
                    style={{ backgroundImage: `url('${boxImage.imageUrl}')` }}
                    onClick={() => toggleBoxState(index)}>
                    {boxStates[index] === 1 && (
                        <lord-icon src="https://cdn.lordicon.com/ymsapbnv.json" trigger="in" delay="400" stroke="bold"
                            state="in-reveal" colors="primary:#109173,secondary:#109173" style={{ width: '50px', height: '50px' }}>
                        </lord-icon>
                    )}
                    {boxStates[index] === 0 && (
                        <lord-icon src="https://cdn.lordicon.com/rmkpgtpt.json" trigger="in" delay="400" stroke="bold"
                            state="in-reveal" colors="primary:#c71f16,secondary:#c71f16" style={{ width: '50px', height: '50px' }}>
                        </lord-icon>
                    )}
                </div>
            );
        });
    };



    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Initialize the intersection observers
        const optionsForImage1 = {
            root: null,
            rootMargin: '0px 0px 0px 0px', // Adjusts the trigger point lower
            threshold: 0.9
        };

        const optionsForImage2 = {
            root: null,
            rootMargin: '0px 0px 0px 0px', // Adjusts the trigger point lower
            threshold: 0.9
        };

        // Observer for the first image
        const observer1 = new IntersectionObserver(entries => {
            const [entry] = entries;
            if (!isManualScroll && entry.intersectionRatio > 0 && entry.intersectionRatio < 1) {
                disableObserverAndScroll(image1Ref, 250); // Adjust this offset as needed
            }
        }, optionsForImage1);

        // Observer for the second image
        const observer2 = new IntersectionObserver(entries => {
            const [entry] = entries;
            if (entry.isIntersecting && showFirstArrow) {
                if (currentMessage >= messages.length || currentMessage === 0) { // Check if messages have finished displaying or haven't started
                    setCurrentMessage(0); // Restart the messages
                }
            } else if (!entry.isIntersecting && currentMessage <= messages.length) {
                setCurrentMessage(0); // Optionally, set currentMessage to messages.length when not intersecting to prevent re-triggering mid-cycle
            }
        }, optionsForImage2);


        // Observe the images
        if (image1Ref.current) observer1.observe(image1Ref.current);
        if (image2Ref.current) observer2.observe(image2Ref.current);

        // Initialize GSAP animations
        const initAnimations = () => {
            ScrollTrigger.batch("section > div", {
                interval: 0.1,
                batchMax: 3,
                onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, stagger: 0.15, overwrite: true }),
                onLeave: (batch) => gsap.set(batch, { autoAlpha: 0, overwrite: true }),
                onEnterBack: (batch) => gsap.to(batch, { autoAlpha: 1, stagger: 0.15, overwrite: true }),
                onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, overwrite: true }),
            });
        };

        initAnimations();
        ScrollTrigger.refresh();

        // Event listener to add more boxes on scroll
        window.addEventListener('scroll', addMoreBoxes);

        // Cleanup function
        return () => {
            window.removeEventListener('scroll', addMoreBoxes);
            ScrollTrigger.clearMatchMedia();
            observer1.disconnect();
            observer2.disconnect();
        };
    }, [boxCount, boxStates]); // Dependencies

    useEffect(() => {
        // Check if all messages have been cycled through
        if (currentMessage >= messages.length) {
            setShowSecondArrow(true);
        }
    }, [currentMessage]);

    const handleSelectPreferences = () => {
        navigate('/preferences');
    };

    const handleSelectLogin = () => {
        navigate('/');
    };

    if (loading) {
        return <Loader />;
    }

    if (user.name === '' || userPreferences.length === 0 || fetchCount >= 4) {
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
                        <div className='no-pref-mess-or'>
                            <p>To access this page you need to:</p>
                        </div>
                        <div className='no-pref-mess-list'>
                            <p>1: Make sure you are logged in</p>
                            <p>2: Have selected your preferences</p>
                            <p>3: Not exceeded the usage limits of 32 images</p>
                        </div>
                        <div className='no-pref-mess-or'>
                        <button onClick={handleSelectPreferences} className="route-button">Select Preferences</button> <p>OR</p> <button onClick={handleSelectLogin} className="route-button">Login</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;550&display=swap" rel="stylesheet" />
            </Helmet>
            <div>
                <Header />
                {errorMessage && <p className="error">{errorMessage}</p>}
            </div>
            <div className="benchmarkPage">
                <div ref={image1Ref} className="image-container">
                    <img src={image1} alt=" " className="full-screen1" id="image1" />
                    <div className="scroll-icon">
                        <lord-icon onClick={() => {
                            scrollToImage2();
                            setCurrentMessage(0); // Start messages when arrow is clicked
                        }}
                            src="https://cdn.lordicon.com/byeqoddv.json"
                            trigger="in"
                            delay="1500"
                            stroke="bold"
                            state="in-reveal"
                            colors="primary:#ffffff"
                            style={{ width: '75px', height: '75px' }}>
                        </lord-icon>
                    </div>
                </div>
                <div ref={image2Ref} className="image-container">
                    <img src={image2} alt=" " className="full-screen2" id="image2" />
                    {showMessage && currentMessage < messages.length && (
                        <div className="welcome-message">
                            <div className="welcome-icons">
                                <lord-icon
                                    src={icons[currentMessage]}
                                    trigger="in"
                                    stroke="bold"
                                    state="in-reveal"
                                    colors="primary:#4be1ec,secondary:#16c72e"
                                    style={{ width: '150px', height: '150px' }}>
                                </lord-icon>
                            </div>
                            {messages[currentMessage].split('\n').map((line, index) => (
                                <p className='message-line' key={index}>{line}</p>
                            ))}
                        </div>
                    )}
                    {showSecondArrow && (
                        <div className="scroll-icon2">
                            <lord-icon onClick={scrollToBoxes}
                                src="https://cdn.lordicon.com/byeqoddv.json"
                                trigger="hover"
                                stroke="bold"
                                state="hover-slide"
                                colors="primary:#ffffff"
                                style={{ width: '75px', height: '75px' }}>
                            </lord-icon>
                        </div>
                    )}
                </div>
            </div>
            <div className="benchmarkPage" ref={boxesRef}>
                <section className="scroll-reveal">
                    {renderBoxes()}
                </section>
                {currentIndex < totalImages && (
                    <button onClick={handleSubmit} className="next-button" style={{ margin: '20px auto', display: 'block' }}>
                        Next Images
                    </button>
                )}
            </div>
        </>
    );
}

export default BenchmarkPage;