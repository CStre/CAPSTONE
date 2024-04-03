import React, { useEffect, useRef, useState } from 'react';
// Include all necessary imports from both components
import './LearnPage.css'; // Assuming HomePage.css contains styles from both components
import Header from '../../components/Header';
import html from "./html.png";
import css from "./css.png";
import es6 from "./es6.png";
import react from "./react.png";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

function LearnPage() {
    // States and refs from HomePage component
    // ...
    // Ref for the parallax container
    const containerRef = useRef();

    // Combine useEffect hooks from both components
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const sections = gsap.utils.toArray(".panel");

        if (containerRef.current) {
            gsap.to(sections, {
                xPercent: -100 * (sections.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: ".container",
                    pin: true,
                    scrub: 1,
                    snap: 1 / (sections.length - 1),
                    end: () => "+=" + containerRef.current.offsetWidth,
                },
            });
        }

        // Cleanup function
        return () => {
            setTimeout(() => {
                ScrollTrigger.getAll().forEach((trigger) => {
                    trigger.kill(); // This should be sufficient to reverse pinning effects
                });
                gsap.killTweensOf('.panel');
            }, 100); // Slight delay to ensure everything is cleaned up properly
        };
    }, []);


    // Logic for rendering HomePage and Parallax content
    return (
        <>
            <div>
                <Header />
            </div>
            <div className="learnPage">

                <section className="banner">
                    <div className="banner-content">
                        <h2>Hi, I'm Peter</h2>
                        <h3>Frontend Developer</h3>
                    </div>
                </section>
                <div ref={containerRef} className="container">
                    <section className="description panel blue">
                        <img src={html} />
                        <h2>HTML</h2>
                        <p>
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Animi
                            labore eius cum perferendis consectetur culpa laboriosam quam, sed
                            ea nihil, suscipit, quidem est expedita. Nihil enim obcaecati
                            deleniti eaque sed.
                        </p>
                    </section>
                    <section className="panel red">
                        <img src={css} />
                        <h2>CSS</h2>
                        <p>
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Animi
                            labore eius cum perferendis consectetur culpa laboriosam quam, sed
                            ea nihil, suscipit, quidem est expedita. Nihil enim obcaecati
                            deleniti eaque sed.
                        </p>
                    </section>
                    <section className="description panel blue">
                        <img src={es6} />
                        <h2>ES6</h2>
                        <p>
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Animi
                            labore eius cum perferendis consectetur culpa laboriosam quam, sed
                            ea nihil, suscipit, quidem est expedita. Nihil enim obcaecati
                            deleniti eaque sed.
                        </p>
                    </section>
                    <section className="panel red">
                        <img src={react} />
                        <h2>React JS</h2>
                        <p>
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Animi
                            labore eius cum perferendis consectetur culpa laboriosam quam, sed
                            ea nihil, suscipit, quidem est expedita. Nihil enim obcaecati
                            deleniti eaque sed.
                        </p>
                    </section>
                </div>
                <section className="footer">
                    <h2>Contact</h2>
                    <form>
                        <input type="text" placeholder="Your email" />

                        <textarea rows={6} placeholder="Message" />
                        <button>SUBMIT</button>
                    </form>
                </section>
            </div>
        </>
    );
}

export default LearnPage;


