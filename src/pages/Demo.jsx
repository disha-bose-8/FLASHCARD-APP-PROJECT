import "../css/Demo.css";
import { Link } from "react-router-dom";
import FlashcardDemo from "../components/FlashcardDemo.jsx";
import { AiOutlineIdcard } from "react-icons/ai";
import { GiBookshelf } from "react-icons/gi";
import { FaBolt } from "react-icons/fa6";
import { FaRegFolderOpen } from "react-icons/fa6";

function Demo() {
    return (
        <div className="demo-container">
            <h2>
                <AiOutlineIdcard className="h2-icon" />Flashcard Studio
            </h2>

            <br></br>
            <p className="title">Smarter reviews. Stronger memory. <GiBookshelf className="title-icon"/></p>
            <p className="info">A better way to study with flashcards is here. Creating your own set of flashcards is simple with our free flashcard maker.</p>
            <div className="demo">
                <div className="demo-bg">
                    <FlashcardDemo/>
                    <br></br>
                </div>

                <div className="wrapper">
                    <div className="btn">
                        <p>Boost your learning efficiency <FaBolt/></p>
                        <p>Sign up now to make your own <FaRegFolderOpen className="sign-icon"/></p>
                        <br></br>
                        <div className="btn-container">
                            <Link to='/register' className="btn-link primary">Get started</Link>
                            <Link to='/login' className="btn-link secondary">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Demo;