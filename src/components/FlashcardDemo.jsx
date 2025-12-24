import React, { useState } from "react";
import "../css/FlashcardDemo.css";
import ReviewCard from "./ReviewCard.jsx";

function FlashcardDemo({ 
    question = "How does this site help?",
    answer = "A web-based Flashcard Maker where users can create, organize, and review flashcards." 
}) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className="flashcard-demo-container">
            <div className="flashcard-demo">
                <h3>Discover how our flashcards work</h3>

                <div className="flashcard-container">
                    <div 
                        className={`card ${flipped ? "flipped" : ""}`} 
                        onClick={() => setFlipped(!flipped)}
                        onMouseEnter={() => setFlipped(true)}
                        onMouseLeave={() => setFlipped(false)}
                    > 
                        <div className="card-inner">
                            <div className="card-front">
                                <p className="q">{question}</p>
                            </div>
                            <div className="card-back">
                                <p>{answer}</p>
                            </div>
                        </div>
                    </div>
                    <ReviewCard/>
                </div>
            </div>
        </div>
    );
}

export default FlashcardDemo;