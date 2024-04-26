/**
 * @fileoverview This is the componenet for the landing page after login. This is the learn page
 * @author Collin Streitman
 * @created 01.24.2024
 * @lastModified By Collin Streitman on 04.26.2024
 *
 * This component includes Parallax fucntionality and various images and icons. This is the
 * longest page of the project.
 */

import React, { useEffect, useRef, useState } from 'react';
import './LearnPage.css';
import Header from '../../components/Header';

import html from "../../images/learn/html.svg";
import css from "../../images/learn/CSS.svg";
import react from "../../images/learn/React.svg";
import logo from "../../images/learn/Logo.svg";
import api from "../../images/learn/PlacesAPI.svg";
import aws from "../../images/learn/AWS.svg";
import django from "../../images/learn/Django.svg";
import eb from "../../images/learn/AWS_EB.svg";
import ec2 from "../../images/learn/AWS_EC2.svg";
import js from "../../images/learn/JavaScript.svg";
import python from "../../images/learn/Python.svg";
import rdb from "../../images/learn/RDB.svg";
import node from "../../images/learn/Node.svg";
import Website from "../../images/learn/Website.svg";
import GitHub from "../../images/learn/GitHub.svg";
import LinkedIn from "../../images/learn/LinkedIn.svg";
import profile from "../../images/learn/profile.svg";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

function LearnPage() {
    // States and refs from HomePage component
    // ...
    // Ref for the parallax container
    const containerRef = useRef();
    const containerRef2 = useRef();

    // Combine useEffect hooks from both components
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const sections = gsap.utils.toArray(containerRef.current.querySelectorAll(".panel"));

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

        const sections2 = gsap.utils.toArray(containerRef2.current.querySelectorAll(".panel"));

        if (containerRef2.current) {
            gsap.to(sections2, {
                xPercent: -100 * (sections2.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: ".container2",
                    pin: true,
                    scrub: 1,
                    snap: 1 / (sections2.length - 1),
                    end: () => "+=" + containerRef2.current.offsetWidth,
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

                <section className="banner1">
                    <div className="banner-content1">
                        <h2>Welcome to</h2>
                        <h3>Building Better Algorithms</h3>
                        <h4>Scoll to learn more about this project</h4>
                    </div>
                </section>

                <div ref={containerRef} className="container">
                    <section className="panel">
                        <img className="logo-img" src={logo} style={{ width: '400px', height: '400px' }} />
                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/piakqbri.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#38cdfe"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>What is this project?</h2>
                        <p>
                            This website is designed to serve as a comprehensive resource for exploring the applications of
                            algorithms, with a particular emphasis on recommendation algorithms. It aims to provide a thorough
                            examination of their benefits, potential adverse effects, and the possibilities for practical and
                            beneficial implementations of what is termed "Ethical Algorithms." By delving into these topics,
                            the site seeks to enlighten users about the nuanced interplay between algorithmic design and ethical
                            considerations in modern computing environments.
                        </p>
                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/oilwhjud.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#00ff66"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>
                            A look at 3 Major Benifits of
                            Recommendation Algorithms
                        </h2>
                        <p>
                            <strong>1. E-Commerce:</strong> Recommendation algorithms can suggest products to
                            customers based on their browsing and purchase history showing
                            you more things you like!
                            <br></br><br></br>
                            <strong>2. Content Streaming:</strong> In platforms like Netflix and Spotify,
                            recommendation algorithms help curate personalized content
                            lists based on users’ viewing or listening histories.
                            <br></br><br></br>
                            <strong>3. Healthcare and Wellness:</strong> Recommendation algorithms can suggest
                            personalized wellness programs, diet plans, and even medical
                            check-ups based on user health data and history.
                        </p>
                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/unukghxb.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#38cdfe"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>The Duality of User-Focused</h2>
                        <p>
                            Many may perceive recommendation algorithms as quintessentially user-centric
                            technologies; however, a distinction must be made between being user-focused
                            and user-centered. Although these algorithms often provide a highly personalized
                            experience, this should not be misconstrued as synonymous with user-centeredness.
                            <br></br><br></br>
                            Upon closer examination, it becomes apparent that many of these algorithms are
                            primarily designed to align with the interests of manufacturers, thereby prioritizing
                            corporate objectives over optimizing user benefits. This misalignment can inadvertently
                            lead to a misleading sense of security among users regarding the true intent and
                            functionality of these algorithms.
                        </p>
                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/pjkwunvs.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#00ff66"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>Why we must Consult Ethics</h2>
                        <p>
                            In numerous domains, the development of products that incorporate personalized
                            recommendation algorithms necessitates a rigorous evaluation of the ethical
                            implications and potential unintended consequences that these technologies may
                            exert on users. This consideration is particularly critical given the substantial
                            amount of time individuals spend interacting with social media platforms daily.
                            Such an assessment ensures that the deployment of these sophisticated algorithms
                            aligns with ethical standards and mitigates adverse effects on user behavior and
                            societal norms.
                        </p>
                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/auvlcjep.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#38cdfe"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>Consider This...</h2>
                        <p>
                            In the field of psychology, it is well-documented that the subconscious mind
                            frequently operates autonomously, executing thoughts and actions without our
                            conscious awareness. Research suggests that for a significant portion of our
                            lives, we operate predominantly within this subconscious state. This phenomenon
                            is particularly pronounced during interactions with social media platforms,
                            where users often engage passively due to their comfort and familiarity with
                            the medium.
                            <br></br><br></br>
                            Consider, for example, a user who is mindlessly scrolling through TikTok.
                            Although the user may appear disengaged, there is still a level of subconscious
                            interaction occurring with the platform. Simultaneously, the platform's algorithms
                            are actively gathering data from these interactions to tailor and enhance content
                            delivery more effectively. This dynamic illustrates the continuous, albeit often
                            unperceived, exchange of information between users and digital applications.
                        </p>
                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/qqzotrmm.json"
                            trigger="in"
                            state="in-oscillate"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#00ff66"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>The Unintentional Harm</h2>
                        <p>
                            In the realm of data collection, a significant portion of the information derived from user
                            interactions with digital products remains opaque to the individuals themselves, beyond their
                            awareness that data is being amassed. Regulatory frameworks delineate the boundaries between
                            private and protected information versus data that is collected under user consent. The volume
                            of data harvested from users substantially exceeds common awareness. Recently, advancements in
                            data utilization have enabled researchers to accurately diagnose conditions such as
                            schizophrenia through analysis of user-generated data.
                        </p>

                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/eulazqty.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#38cdfe"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>Digital Phenotyping</h2>
                        <p>
                            Digital phenotyping, while not widely recognized by the general public, is an advanced analytical
                            technique that involves drawing accurate conclusions from a wide-ranging and ostensibly disparate
                            collection of user data. This method holds significant potential for practical and beneficial
                            applications, particularly within the healthcare sector.
                            <br></br><br></br>
                            A notable example of its efficacy was demonstrated in a recent study conducted by a research
                            institute. Researchers developed a mobile application for iPhones that collected data from Instagram.
                            Participants consented to the use of this application, which was able to diagnose depression with a
                            remarkable 95% accuracy among the subjects.
                        </p>
                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/ynijyuos.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#00ff66"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>Revenue over Safety</h2>
                        <p>
                            The field of software development is highly driven by revenue streams. Many individuals enter the field
                            of computer science due to its lucrative potential. Companies, perhaps even more motivated by financial incentives,
                            often engage in extensive data collection as a primary revenue stream. Notably, companies such as Google have
                            capitalized significantly on this practice, not through the mere collection of data but through its monetization
                            via sales to third-party entities.
                            <br></br><br></br>
                            The ethical implications of such data utilization by third parties remain largely obscure and unmonitored.
                            For instance, data collected by applications like Instagram could potentially be used to diagnose psychological
                            conditions such as depression.
                            <br></br><br></br>
                            This raises critical ethical questions: Is it responsible to sell data that could
                            be classified as medical? Furthermore, should the classification of data be based on its intended use or its
                            potential use, and what are the most responsible criteria for determining this?
                        </p>
                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/uktwwckg.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#38cdfe"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>The User Centered Design</h2>
                        <p>
                            This discussion leads us to revisit the foundational question: What constitutes a User-Centered Ethical Algorithm?
                            <br></br><br></br>
                            Such an algorithm is meticulously crafted with the consumer's priorities foremost. It is developed from the outset
                            to be responsive and adaptive, incorporating a rigorous design philosophy where each data point collected and user
                            interaction is methodically analyzed. Furthermore, every aspect of its functionality undergoes extensive scrutiny
                            and debate concerning its ethical implications and implementation, ensuring that it adheres to the highest standards
                            of user-centric ethics.
                        </p>

                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/rqdzxkkr.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#00ff66"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>
                            Ethical Algorithms from the Ground Up
                        </h2>
                        <p>
                            This website serves not only to educate about User-Centered Algorithms but also to demonstrate a practical
                            implementation. While no algorithm is flawless, the adaptive qualities and streamlined design of the showcased
                            algorithm exemplify the core principles of a User-Centered Approach as described herein.
                        </p>

                    </section>
                    <section className="panel">
                        <lord-icon
                            src="https://cdn.lordicon.com/kzmcbjzi.json"
                            trigger="in"
                            state="in-reveal"
                            stroke="bold"
                            colors="primary:#c2c2c2 ,secondary:#38cdfe"
                            style={{ width: '200px', height: '200px' }}>
                        </lord-icon>
                        <h2>
                            Check out the Prototype!
                        </h2>
                        <p>
                            Below are the methodologies employed to ensure our algorithm prioritizes user-centricity:
                            <br></br><br></br>
                            1. All data is securely encrypted and maintained in strict separation from user identifiers. Data transfer
                            utilizes session-based authentication tokenization, ensuring that data is transmitted in a format that is,
                            outside of its intended context, unrecognizable and secure.
                            <br></br><br></br>
                            2. We eschew designs that employ endless scrolling or unrestricted usage. Our algorithm imposes a cap on user
                            interaction time to prevent addictive behaviors typically induced by unlimited scrolling mechanisms,
                            which often lead to excessive data collection.
                            <br></br><br></br>
                            3. While our algorithm dynamically adapts content to align with user preferences, it conscientiously avoids
                            perpetuating a feedback loop of preferred content. Moreover, it does not reintroduce previously declined content
                            to reassess user interest. Instead, it employs a refined and intuitive mechanism to periodically update user
                            preferences based on explicit interactions.
                        </p>

                    </section>
                </div>
                <section className="panel">
                    <lord-icon
                        src="https://cdn.lordicon.com/jdalicnn.json"
                        trigger="in"
                        state="in-reveal"
                        stroke="bold"
                        colors="primary:#c2c2c2 ,secondary:#00ff66"
                        style={{ width: '200px', height: '200px' }}>
                    </lord-icon>
                    <h2>Technology Stack</h2>
                    <p>
                        This project represents a six-month endeavor designed to demonstrate my comprehensive capabilities in Full-Stack Development,
                        along with a profound commitment to aesthetic design and optimizing the user experience. As the culminating capstone project
                        of my undergraduate studies, it was successfully completed in April 2024.
                        <br></br><br></br>
                        Please continue scrolling to explore the diverse array of technologies and methodologies employed in the development of this project.
                    </p>

                </section>
                <div ref={containerRef2} className="container2">
                    <section className="description panel blue">
                        <img src={html} />
                        <h2>HTML</h2>
                    </section>
                    <section className="panel red">
                        <img src={css} />
                        <h2>CSS</h2>
                    </section>
                    <section className="description panel blue">
                        <img src={js} />
                        <h2>JavaScript</h2>
                    </section>
                    <section className="panel red">
                        <img src={python} />
                        <h2>Python</h2>
                    </section>
                    <section className="panel red">
                        <img src={django} />
                        <h2>Django</h2>
                    </section>
                    <section className="panel red">
                        <img src={react} />
                        <h2>React</h2>
                    </section>
                    <section className="panel red">
                        <img src={api} />
                        <h2>Google Places API</h2>
                    </section>
                    <section className="panel red">
                        <img src={aws} />
                        <h2>AWS</h2>
                    </section>
                    <section className="panel red">
                        <img src={rdb} />
                        <h2>AWS Relational Database</h2>
                    </section>
                    <section className="panel red">
                        <img src={eb} />
                        <h2>AWS Elastic Beanstalk</h2>
                    </section>
                    <section className="panel red">
                        <img src={ec2} />
                        <h2>AWS EC2</h2>
                    </section>
                    <section className="panel red">
                        <img src={node} />
                        <h2>Nodejs</h2>
                    </section>
                </div>
                <section className="end-panel">
                    <h1>About the Creator</h1>
                    <img src={profile} alt="Collin Streitman" style={{ width: '300px', height: '300px' }} />
                    <h2>Collin Streitman</h2>
                    <p>
                        Hi, I'm Collin Streitman. I'm a curious and passionate individual with interests in design,
                        user experience, travel, photography, leadership, freedom, and full-stack development.
                        My hobbies include backpacking and skiing.
                    </p>
                    <div className="connect">
                        <h2>Connect with me:</h2>
                        <div className="social-links">
                            <a href="https://github.com/CStre" target="_blank" rel="noopener noreferrer">
                                <img src={GitHub} alt="GitHub" style={{ width: '75px', height: '75px' }} />
                            </a>
                            <a href="https://www.linkedin.com/in/collin.streitman" target="_blank" rel="noopener noreferrer">
                                <img src={LinkedIn} alt="LinkedIn" style={{ width: '75px', height: '75px' }} />
                            </a>
                            <a href="https://collin-streitman.com" target="_blank" rel="noopener noreferrer">
                                <img src={Website} alt="Website" style={{ width: '75px', height: '75px' }} />
                            </a>
                        </div>
                    </div>
                </section>
            </div>

        </>
    );
}

export default LearnPage;


