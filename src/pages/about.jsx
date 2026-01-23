import React from "react";
import "../css/about.css";
import { useOutletContext} from "react-router-dom";
import { useEffect } from "react";
const About = () => {
 
        const outletContext = useOutletContext();
        const setPageTitle = outletContext?.setPageTitle || (() => {});
    
        useEffect(() => {
            setPageTitle("About");
        }, [setPageTitle]);

    return (
        <div className="about-page">
            <div className="about-content">

                <h1>About Flashcard App</h1>

                <p>
                    The Flashcard App is a streamlined study tool designed to help learners organize
                    information and revise efficiently. It allows users to create custom flashcards,
                    categorize them into folders, and review them through a simple and intuitive
                    interface. The focus is on clarity, usability, and an experience that supports
                    fast, distraction-free learning.
                </p>

                <h2 className="about-section-title">Our Purpose</h2>
                <p>
                    This application was developed to provide students and self-learners with a clean,
                    reliable platform for daily revision. Many existing tools are either too limited
                    or unnecessarily complex. Our goal is to deliver a straightforward and consistent
                    studying experience that helps users stay productive without feeling overwhelmed.
                </p>

                <h2 className="about-section-title">What the App Offers</h2>
                <ul>
                    <li>Organized folder-based flashcard management</li>
                    <li>Effortless card creation and editing</li>
                    <li>Flip-card review mode for efficient revision</li>
                    <li>Responsive UI with theme (light/dark) support</li>
                    <li>Secure login and user authentication</li>
                    <li>Cloud-backed storage using MongoDB & Express</li>
                </ul>

                <h2 className="about-section-title">Creators</h2>
                <ul>
                    <li>
                        Dharani S —{" "}
                        <a href="mailto:anu293575@gmail.com">anu293575@gmail.com</a>
                    </li>
                    <li>
                        Diya J Marar —{" "}
                        <a href="mailto:diyajithumarar@gmail.com">diyajithumarar@gmail.com</a>
                    </li>
                    <li>
                        Disha Bose —{" "}
                        <a href="mailto:dishab719@gmail.com">dishab719@gmail.com</a>
                    </li>
                </ul>

                <h2 className="about-section-title">Project Repository</h2>
                <a
                    href="https://github.com/disha-bose-8/FLASHCARD-APP-PROJECT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                >
                    View Project on GitHub
                </a>
            </div>
        </div>
    );
};

export default About;
