import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import App from '../../App';
import './BenchmarkPage.css';
import image1 from '../../images/1.png';
import image2 from '../../images/2.png';

function BenchmarkPage() {
    const [boxCount, setBoxCount] = useState(9);
    const [boxStates, setBoxStates] = useState(Array(30).fill(0));
    const [isManualScroll, setIsManualScroll] = useState(false);  // State variable

    const [currentMessage, setCurrentMessage] = useState(0);
    const [showMessage, setShowMessage] = useState(false);

    const [showFirstArrow, setShowFirstArrow] = useState(false);
    const [showSecondArrow, setShowSecondArrow] = useState(false);


    const image1Ref = useRef(null);
    const image2Ref = useRef(null);
    const boxesRef = useRef(null);

    const messages = [
        "Welcome to Travel.\nNow that you have selected your preferences, you can travel around.",
        "Click once,\nif you like the image.",
        "Double click,\nif you do not.",
        "Check on the Dashboard,\nto see preferences change.",
        "Be mindful of the usage limits.\nHappy Traveling!"
    ];

    const scrollToElement = (ref, offset = 0) => {
        const topPosition = ref.current.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: topPosition, behavior: 'smooth' });
    };

    // Scroll functions for icons
    const scrollToImage2 = () => scrollToElement(image2Ref, -150);
    const scrollToBoxes = () => scrollToElement(boxesRef, 0);

    const disableObserverAndScroll = (ref, offset) => {
        setIsManualScroll(true);
        const topPosition = ref.current.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: topPosition, behavior: 'smooth' });
        setTimeout(() => setIsManualScroll(false), 1000); // Re-enable after 1 second
    };

    const toggleBoxState = (index) => {
        setBoxStates(currentStates => {
            const newStates = [...currentStates];
            newStates[index] = newStates[index] === 0 ? 1 : (newStates[index] === 1 ? 2 : 1);
            return newStates;
        });
    };

    const addMoreBoxes = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            setBoxCount(boxCount + 9);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFirstArrow(true);
        }, 3000); // 3 seconds after initial scroll

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (currentMessage >= messages.length) {
            setShowSecondArrow(true);
        }
    }, [currentMessage]);

    useEffect(() => {
        const predefinedScrollPoint = image1Ref;
        const offset = -250; // Set your desired offset here

        // Adding a slight delay to ensure the DOM is fully loaded
        setTimeout(() => {
            scrollToElement(predefinedScrollPoint, offset);
        }, 100); // Delay of 100 milliseconds
    }, []);

    useEffect(() => {
        if (currentMessage < messages.length) {
            setShowMessage(true);
            const timer = setTimeout(() => {
                setShowMessage(false);
                const timeout = setTimeout(() => {
                    setCurrentMessage(currentMessage + 1);
                }, 500); // Delay before showing the next message
                return () => clearTimeout(timeout);
            }, 3000); // Display each message for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [currentMessage]);

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
    }, [boxCount]); // Dependencies



    return (
        <>
            <div>
                <Header />
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
                            trigger="hover"
                            stroke="bold"
                            state="hover-slide"
                            colors="primary:#ffffff"
                            style={{ width: '100px', height: '100px' }}>
                        </lord-icon>
                    </div>
                </div>
                <div ref={image2Ref} className="image-container">
                    <img src={image2} alt=" " className="full-screen2" id="image2" />
                    {showMessage && currentMessage < messages.length && (
                        <div className="welcome-message">
                            {messages[currentMessage].split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    )}
                    <div className="scroll-icon">
                        <lord-icon onClick={scrollToBoxes}
                            src="https://cdn.lordicon.com/byeqoddv.json"
                            trigger="hover"
                            stroke="bold"
                            state="hover-slide"
                            colors="primary:#ffffff"
                            style={{ width: '100px', height: '100px' }}>
                        </lord-icon>
                    </div>
                </div>
            </div>
            <div className="benchmarkPage" ref={boxesRef}>
                <section className="scroll-reveal">
                    {Array.from({ length: boxCount }, (_, i) => (
                        <div key={i}
                            className={`box ${boxStates[i] === 1 ? 'green' : boxStates[i] === 2 ? 'red' : ''}`}
                            onClick={() => toggleBoxState(i)}>
                            {boxStates[i] === 1 && (
                                <lord-icon
                                    src="https://cdn.lordicon.com/ymsapbnv.json"
                                    trigger="in"
                                    delay="400"
                                    stroke="bold"
                                    state="in-reveal"
                                    colors="primary:#109173,secondary:#109173"
                                    style={{ width: '50px', height: '50px' }}>
                                </lord-icon>
                            )}
                            {boxStates[i] === 2 && (
                                <lord-icon
                                    src="https://cdn.lordicon.com/rmkpgtpt.json"
                                    trigger="in"
                                    delay="400"
                                    stroke="bold"
                                    state="in-reveal"
                                    colors="primary:#c71f16,secondary:#c71f16"
                                    style={{ width: '50px', height: '50px' }}>
                                </lord-icon>
                            )}
                        </div>
                    ))}
                </section>
            </div>
        </>
    );

}

export default BenchmarkPage;