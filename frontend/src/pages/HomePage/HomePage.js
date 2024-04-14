import React, { useEffect, useRef, useState } from 'react';
import './HomePage.css';
import Loader from '../../components/Loader';
import App from '../../App';
import { CSSTransition } from 'react-transition-group';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '../../AuthContext';

function HomePage() {
    const [showLoader, setShowLoader] = useState(true);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [userName, setUserName] = useState('');
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
    const [showWelcomeMessage2, setShowWelcomeMessage2] = useState(false);
    const [showExploreButton, setShowExploreButton] = useState(false);

    const csrfToken = Cookies.get('csrftoken');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const navigate = useNavigate();

    const [passwordStrength, setPasswordStrength] = useState("");
    const strengthLabels = ["weak", "medium", "medium", "strong"];

    const { isAuthenticated, setIsAuthenticated } = useAuth();



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

    // Update the login status and retreive name from API
    const updateLoginStatus = () => {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        setShowLoginForm(!isLoggedIn);
        if (isLoggedIn) {
            console.log("Checking login status...");
            axios.get(`${API_BASE_URL}/user-info/`)
                .then(response => {
                    console.log("Fetch user info successful:", response.data);
                    // Assuming the response contains the user's name
                    setUserName(response.data.name);
                    setShowWelcomeMessage(true);

                    setTimeout(() => {
                        setShowWelcomeMessage(false);
                        setShowWelcomeMessage2(true);

                        setTimeout(() => {
                            setShowWelcomeMessage2(false);
                            setShowExploreButton(true);
                        }, 3000);
                    }, 3000);
                })
                .catch(error => {
                    console.error('Error fetching user info', error);
                    // Handle error (e.g., by redirecting to a login page or showing a message)
                });
        } else {
            console.log("Not logged in");
        }
    };


    // useEffect(() => {
    //     updateLoginStatus();
    //     console.log("showLoginForm State Updated:", showLoginForm);
    // }, [isAuthenticated]); // Log when showLoginForm updates

    // Function to trigger confetti
    const triggerConfetti = () => {
        confetti({
            particleCount: 1000,
            spread: 360,
            zIndex: 9999 // Ensure confetti is above their elements
        });
        // Navigate after a delay
        setTimeout(() => {
            navigate('/learn');
            //document.body.style.opacity = '1';
        }, 1500); // 1.5 second delay
    };

    useEffect(() => {
        setShowLoginForm(!isAuthenticated);
        if (!isAuthenticated) {
            // User is not authenticated
            console.log("showLoginForm State Updated:");
            setUserName('');
            setShowWelcomeMessage(false);
            setShowWelcomeMessage2(false);
            setShowExploreButton(false);
        } else {
            // User is authenticated, handle accordingly
            // For example, fetching user info if needed
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);
        let t = 0;
        let clicked = false;
        let maxl = 300;
        let minl = 50;
        let n = 30;
        let numt = 1000;
        let q = 10;

        let activeConnections = 0;
        const maxConnections = 20; // Maximum allowed connections

        const predefinedColors = [
            "hsl(210,100%,80%)", // Example color
            "hsl(121,100%,50%)",
            "hsl(186, 100%, 50%)"
            // Add more colors as needed
        ];

        function init() {
            c.fillStyle = "rgba(30,30,30,1)";
            c.fillRect(0, 0, w, h);
            return { c: c, canvas: canvas };
        }

        function dist(p1x, p1y, p2x, p2y) {
            return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
        }

        class segment {
            constructor(parent, l, a, first) {
                this.first = first;
                if (first) {
                    this.pos = {
                        x: parent.x,
                        y: parent.y
                    };
                } else {
                    this.pos = {
                        x: parent.nextPos.x,
                        y: parent.nextPos.y
                    };
                }
                this.l = l;
                this.ang = a;
                this.nextPos = {
                    x: this.pos.x + this.l * Math.cos(this.ang),
                    y: this.pos.y + this.l * Math.sin(this.ang)
                };
            }
            update(t) {
                this.ang = Math.atan2(t.y - this.pos.y, t.x - this.pos.x);
                this.pos.x = t.x + this.l * Math.cos(this.ang - Math.PI);
                this.pos.y = t.y + this.l * Math.sin(this.ang - Math.PI);
                this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
                this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
            }
            fallback(t) {
                this.pos.x = t.x;
                this.pos.y = t.y;
                this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
                this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
            }
            show() {
                c.lineTo(this.nextPos.x, this.nextPos.y);
            }
        }

        class tentacle {
            constructor(x, y, l, n, a) {
                this.x = x;
                this.y = y;
                this.l = l;
                this.n = n;
                this.t = {};
                this.rand = Math.random();
                this.color = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
                this.segments = [new segment(this, this.l / this.n, 0, true)];
                for (let i = 1; i < this.n; i++) {
                    this.segments.push(
                        new segment(this.segments[i - 1], this.l / this.n, 0, false)
                    );
                }
            }
            move(last_target, target) {
                this.angle = Math.atan2(target.y - this.y, target.x - this.x);
                this.dt = dist(last_target.x, last_target.y, target.x, target.y) + 5;
                this.t = {
                    x: target.x - 0.8 * this.dt * Math.cos(this.angle),
                    y: target.y - 0.8 * this.dt * Math.sin(this.angle)
                };
                if (this.t.x) {
                    this.segments[this.n - 1].update(this.t);
                } else {
                    this.segments[this.n - 1].update(target);
                }
                for (let i = this.n - 2; i >= 0; i--) {
                    this.segments[i].update(this.segments[i + 1].pos);
                }
                if (
                    dist(this.x, this.y, target.x, target.y) <=
                    this.l + dist(last_target.x, last_target.y, target.x, target.y)
                ) {
                    this.segments[0].fallback({ x: this.x, y: this.y });
                    for (let i = 1; i < this.n; i++) {
                        this.segments[i].fallback(this.segments[i - 1].nextPos);
                    }
                }
            }
            show(target) {
                if (activeConnections >= maxConnections) {
                    return;
                }
                if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                    activeConnections++;
                    c.globalCompositeOperation = "lighter";
                    c.beginPath();
                    c.lineTo(this.x, this.y);
                    for (let i = 0; i < this.n; i++) {
                        this.segments[i].show();
                    }
                    c.strokeStyle = this.color;
                    c.lineWidth = this.rand * 2;
                    c.lineCap = "round";
                    c.lineJoin = "round";
                    c.stroke();
                    c.globalCompositeOperation = "source-over";
                }
            }
            show2(target) {
                if (activeConnections >= maxConnections) {
                    return;
                }
                c.beginPath();
                if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                    c.arc(this.x, this.y, 2 * this.rand + 1, 0, 2 * Math.PI);
                    c.fillStyle = "white";
                } else {
                    c.arc(this.x, this.y, this.rand * 2, 0, 2 * Math.PI);
                    c.fillStyle = "darkcyan";
                }
                c.fill();
            }
        }

        let mouse = { x: false, y: false };
        let last_target = { x: 0, y: 0 };
        let target = { x: w / 2, y: h / 2 };
        let tent = [];

        for (let i = 0; i < numt; i++) {
            tent.push(
                new tentacle(
                    Math.random() * w,
                    Math.random() * h,
                    Math.random() * (maxl - minl) + minl,
                    n,
                    Math.random() * 2 * Math.PI
                )
            );
        }

        function draw() {
            activeConnections = 0;
            if (mouse.x) {
                target.errx = mouse.x - target.x;
                target.erry = mouse.y - target.y;
            } else {
                target.errx =
                    w / 2 +
                    ((h / 2 - q) * Math.sqrt(2) * Math.cos(t)) /
                    (Math.pow(Math.sin(t), 2) + 1) -
                    target.x;
                target.erry =
                    h / 2 +
                    ((h / 2 - q) * Math.sqrt(2) * Math.cos(t) * Math.sin(t)) /
                    (Math.pow(Math.sin(t), 2) + 1) -
                    target.y;
            }

            target.x += target.errx / 10;
            target.y += target.erry / 10;

            t += 0.01;

            c.beginPath();
            c.arc(
                target.x,
                target.y,
                dist(last_target.x, last_target.y, target.x, target.y) + 5,
                0,
                2 * Math.PI
            );
            c.fillStyle = "hsl(210,100%,80%)";
            c.fill();

            for (let i = 0; i < numt; i++) {
                tent[i].move(last_target, target);
                tent[i].show2(target);
            }
            for (let i = 0; i < numt; i++) {
                tent[i].show(target);
            }
            last_target.x = target.x;
            last_target.y = target.y;
        }


        function loop() {
            animationRef.current = window.requestAnimationFrame(loop);
            c.clearRect(0, 0, w, h);
            draw();
        }

        canvas.addEventListener('mousemove', function (e) {
            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);

        canvas.addEventListener('mouseleave', function () {
            mouse.x = false;
            mouse.y = false;
        });

        canvas.addEventListener('mousedown', function () {
            clicked = true;
        });

        canvas.addEventListener('mouseup', function () {
            clicked = false;
        });

        window.addEventListener('resize', function () {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            loop();
        });

        init();
        loop();

        const handleMouseMove = (e) => {
            mouse.x = e.pageX - canvas.offsetLeft;
            mouse.y = e.pageY - canvas.offsetTop;
        };

        const handleMouseLeave = () => {
            mouse.x = false;
            mouse.y = false;
        };

        const handleMouseDown = () => {
            clicked = true;
        };

        const handleMouseUp = () => {
            clicked = false;
        };

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            loop();
        };

        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);

        const loaderTimeout = setTimeout(() => {
            setShowLoader(false);
        }, 3000);

        // Cleanup function
        return () => {
            if (animationRef.current) {
                window.cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);

            clearTimeout(loaderTimeout);
        };
    }, [showLoginForm]);

    useEffect(() => {
        // Loader timeout logic
        const loaderTimeout = setTimeout(() => {
            setShowLoader(false);
        }, 3000);
    }, []);

    useEffect(() => {
        console.log("Updated Show Login Form:", showLoginForm);
    }, [showLoginForm]);

    // Function for handling user registration
    const handleRegistration = (e) => {
        e.preventDefault();
        const name = document.getElementById('logname').value;
        const username = document.getElementById('logemail').value;
        const password = document.getElementById('logpass').value;
    
        axios.post(`${API_BASE_URL}/register/`, { 
            name, 
            username, 
            password 
        })
        .then(response => {
            console.log('Registration Successful', response.data);
            // After successful registration, attempt to log in
            return axios.post(`${API_BASE_URL}/login/`, {
                username,
                password
            }, {
                headers: { 'X-CSRFToken': csrfToken }
            });
        })
        .then(response => {
                console.log("Login successful after registration:", response.data);
                localStorage.setItem('userLoggedIn', 'true');
                setIsAuthenticated(true);
                // Fetch user information after successful login
                return axios.get(`${API_BASE_URL}/user-info/`);
        })
        .then(response => {
            // Assuming the response contains the user's name
            setUserName(response.data.name);
        
            // Immediately update login-related states
            setShowLoginForm(false);
            setShowWelcomeMessage(true);
        
            // Set a delay to hide the first message and show the second message
            setTimeout(() => {
                setShowWelcomeMessage(false); // Hide first welcome message after 3 seconds
        
                setTimeout(() => {
                    setShowWelcomeMessage2(true); // Show second welcome message
        
                    setTimeout(() => {
                        setShowWelcomeMessage2(false); // Hide second welcome message after 3 seconds
                        setShowExploreButton(true); // Show explore button
                    }, 3000); // Adjust timing as needed
                }, 500); // Short delay before showing the second message
            }, 3000); // Time until first WelcomeMessage disappears
        })
        .catch(error => {
            // Handle errors for registration or login
            if (error.response) {
                console.error('Error', error.response.data);
                // Display appropriate error message
                const errorMessage = error.response.data.username 
                    ? error.response.data.username[0]
                    : 'Registration failed. Please try again later.';
                alert(errorMessage);
            } else {
                console.error('Error occurred', error.message);
            }
        });
    };
    



    const handleUserLogin = (e) => {
        e.preventDefault();
        const username = document.getElementById('logemail2').value;
        const password = document.getElementById('logpass2').value;
    
        axios.post(`${API_BASE_URL}/login/`, {
            username,
            password
        }, {
            headers: { 'X-CSRFToken': csrfToken }
        })
        .then(response => {
            console.log("Login successful:", response.data);
            localStorage.setItem('userLoggedIn', 'true');
            setIsAuthenticated(true);
            
            // Fetch user information after successful login
            return axios.get(`${API_BASE_URL}/user-info/`);
        })
        .then(response => {
            // Assuming the response contains the user's name
            setUserName(response.data.name);
    
            // Immediately update login-related states
            setShowLoginForm(false);
            setShowWelcomeMessage(true);
    
            // Set a delay to hide the first message and show the second message
            setTimeout(() => {
                setShowWelcomeMessage(false); // Hide first welcome message after 3 seconds
    
                setTimeout(() => {
                    setShowWelcomeMessage2(true); // Show second welcome message
    
                    setTimeout(() => {
                        setShowWelcomeMessage2(false); // Hide second welcome message after 3 seconds
                        setShowExploreButton(true); // Show explore button
                    }, 3000); // Adjust timing as needed
                }, 500); // Short delay before showing the second message
            }, 3000); // Time until first WelcomeMessage disappears
        })
        .catch(error => {
            console.error('Login Error', error);
        });
    };
    



    return (

        <div className="homePage">
            {/* Loader Overlay */}
            {showLoader && (
                <div className="loaderOverlay">
                    <Loader />
                </div>
            )}

            {/* Canvas */}
            <canvas ref={canvasRef} id="canvas"></canvas>

            {/* Login Form Transition */}
            <CSSTransition
                in={showLoginForm}
                timeout={300}
                classNames="form"
                unmountOnExit
            >
                <div className="form-overlay">
                    {/* Form content */}
                </div>
            </CSSTransition>

            {/* Welcome Message Transition */}
            <CSSTransition
                in={showWelcomeMessage}
                timeout={500}
                classNames="message"
                unmountOnExit
            >
                <div className="welcome-message">
                    <lord-icon
                        src="https://cdn.lordicon.com/betpsixk.json"
                        trigger="in"
                        delay="0"
                        stroke="bold"
                        state="in-reveal"
                        style={{ width: '100px', height: '100px' }}> {/* Style as object */}
                    </lord-icon>
                    <div>Hello {userName}!</div> {/* Text in a new line */}
                </div>
            </CSSTransition>


            {/* Welcome Message 2 and the Button */}
            {showWelcomeMessage2 && (
                <CSSTransition
                    in={showWelcomeMessage2}
                    timeout={500}
                    classNames="message"
                    unmountOnExit
                >
                    <div className="welcome-message">
                        <lord-icon
                            src="https://cdn.lordicon.com/tycjpwlg.json"
                            trigger="in"
                            delay="0"
                            state="in-reveal"
                            style={{ width: '100px', height: '100px' }}> {/* Style as object */}
                        </lord-icon>
                        <div>Click on Explore when ready.</div> {/* Text in a new line */}
                    </div>
                </CSSTransition>
            )}

            {showExploreButton && (
                <div className="wrapper">
                    <button className="confetti-button" onClick={triggerConfetti}>
                        <lord-icon
                            src="https://cdn.lordicon.com/pbbsmkso.json"
                            trigger="hover"
                            stroke="bold"
                            state="hover-rotate-up-to-down"
                            colors="primary:#ffffff,secondary:#ffffff"
                            style={{ width: '100px', height: '100px' }}>
                        </lord-icon>
                    </button>
                </div>
            )}

            {/* Login Form */}
            {showLoginForm && (
                <div className="form-overlay">
                    <div className="section">
                        <div className="container">
                            <div className="row full-height justify-content-center">
                                <div className="col-12 text-center align-self-center py-5">
                                    <div className="section pb-5 pt-5 pt-sm-2 text-center">
                                        <input className="checkbox" type="checkbox" id="reg-log" name="reg-log" />
                                        <label htmlFor="reg-log">
                                            <lord-icon
                                                src="https://cdn.lordicon.com/zleqbfhf.json"
                                                trigger="click"
                                                stroke="bold"
                                                colors="primary:#ffffff"
                                                style={{ width: '25px', height: '25px' }}>
                                            </lord-icon>
                                        </label>
                                        <label htmlFor="reg-log"></label>
                                        <div className="card-3d-wrap mx-auto">
                                            <div className="card-3d-wrapper">
                                                <div className="card-front">
                                                    <form onSubmit={handleUserLogin}>
                                                        <div className="center-wrap">
                                                            <div className="section text-center">
                                                                <label htmlFor="reg-log-2">
                                                                    <lord-icon className="mb-4 pb-3"
                                                                        src="https://cdn.lordicon.com/auvlcjep.json"
                                                                        trigger="hover"
                                                                        stroke="bold"
                                                                        style={{ width: '50px', height: '50px' }}
                                                                        colors="primary:#c4c3ca,secondary:#00e6ff">
                                                                    </lord-icon>
                                                                </label>
                                                                <h4 className="mb-4 pb-3">Log In</h4>
                                                                <div className="form-group">
                                                                    <input type="username" name="logemail2" className="form-style" placeholder="Your Email" id="logemail2" autoComplete="off" required />
                                                                    <i className="input-icon uil uil-at"></i>
                                                                </div>
                                                                <div className="form-group mt-2">
                                                                    <input type="password" name="logpass2" className="form-style" placeholder="Your Password" id="logpass2" autoComplete="off" required />
                                                                    <i className="input-icon uil uil-lock-alt"></i>
                                                                </div>
                                                                <button type="submit" className="btn mt-4" onSubmit={handleUserLogin}>submit</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="card-back">
                                                    <form onSubmit={handleRegistration}>
                                                        <div className="center-wrap">
                                                            <div className="section text-center">
                                                                <label htmlFor="reg-log-2">
                                                                    <lord-icon className="mb-4 pb-3"
                                                                        src="https://cdn.lordicon.com/ebjjjrhp.json"
                                                                        trigger="hover"
                                                                        stroke="bold"
                                                                        state="hover-spin"
                                                                        style={{ width: '50px', height: '50px' }}
                                                                        colors="primary:#c4c3ca,secondary:#00e6ff">
                                                                    </lord-icon>
                                                                </label>
                                                                <h4 className="mb-4 pb-3">Sign Up</h4>
                                                                <div className="form-group mt-1">
                                                                    <input type="text" name="logname" className="form-style" placeholder="Your Full Name" id="logname" autoComplete="off" required />
                                                                    <i className="input-icon uil uil-user"></i>
                                                                </div>
                                                                <div className="form-group mt-2">
                                                                    <input type="username" name="logemail" className="form-style" placeholder="Your Email" id="logemail" autoComplete="off" required />
                                                                    <i className="input-icon uil uil-at"></i>
                                                                </div>
                                                                <div className="form-group mt-3">
                                                                    <input
                                                                        type="password"
                                                                        name="logpass"
                                                                        className="form-style"
                                                                        placeholder="Your Password"
                                                                        id="logpass"
                                                                        autoComplete="off"
                                                                        required
                                                                        onChange={handlePasswordChange}
                                                                    />
                                                                    <div className={`bars ${passwordStrength}`}>
                                                                        <div></div>
                                                                    </div>
                                                                    <div className="strength">
                                                                        {passwordStrength && `${passwordStrength} password`}
                                                                    </div>
                                                                    <i className="input-icon uil uil-lock-alt"></i>
                                                                </div>
                                                                <button type="submit" className="btn mt-4" onSubmit={handleRegistration}>submit</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;