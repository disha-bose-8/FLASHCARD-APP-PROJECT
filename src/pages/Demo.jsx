import "../css/Demo.css";
import { Link } from "react-router-dom";
import FlashcardDemo from "../components/FlashcardDemo.jsx";
import { FaBookOpen, FaBoltLightning, FaFolderOpen } from "react-icons/fa6";

function Demo() {
    return (
        <div className="hero-bg">
            <div className="hero-blob"></div>

            <div className="demo-container">
                <h2 className="hero-title">FLASHCARD PRO</h2>

                <p className="hero-tagline">
                    <FaBookOpen className="icon" />
                    Master anything, one flip at a time
                    <FaBookOpen className="icon" />
                </p>

                <p className="hero-description">
                    A better way to study with flashcards is here. Creating your own set of
                    flashcards is simple with our free flashcard maker.
                </p>

                <div className="demo">
                    <div className="demo-bg">
                        <FlashcardDemo />
                        <br />
                    </div>

                    <div className="wrapper">
                        <div className="btn">
                            <p>
                                Boost your learning efficiency
                                <FaBoltLightning className="icon-inline" />
                            </p>
                            <p>
                                Sign up now to make your own
                                <FaFolderOpen className="icon-inline" />
                            </p>
                            <br />
                            <div className="btn-container">
                                <Link to="/register" className="btn-link primary">Get started</Link>
                                <Link to="/login" className="btn-link secondary">Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Demo;
