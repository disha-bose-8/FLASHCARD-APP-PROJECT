import React, { useState, useEffect, useRef } from "react";
import "../css/typing-mode.css";
import { useOutletContext } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/api`;

function Typing() {
  const [user, setUser] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isStarted, setIsStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const timerRef = useRef(null);
  const outletContext = useOutletContext();
  const setPageTitle = outletContext?.setPageTitle || (() => {});

  useEffect(() => {
    setPageTitle("Typing Mode");
  }, [setPageTitle]);

  // Load user
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  }, []);

  // Load flashcards from selected folders only
  useEffect(() => {
    if (!user?._id) return;

    const selectedFolderIds = (() => {
      try {
        const val = sessionStorage.getItem("reviewFolders");
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    })();

    async function loadCards() {
      try {
        const res = await fetch(`${API}/folders/${user._id}`);
        const data = await res.json();

        // Only include flashcards from selected folders (robust ID comparison)
        const filtered = data.filter(folder =>
          selectedFolderIds.some(selId => String(selId) === String(folder._id))
        );
        const merged = filtered.flatMap(folder =>
          folder.flashcards.map((card, idx) => ({
            ...card,
            folderId: folder._id,
            index: idx,
          }))
        );

        setFlashcards(merged);
      } catch (err) {
        console.error(err);
      }
    }

    loadCards();
  }, [user?._id]);

  // Timer logic - ONLY when started
  useEffect(() => {
    if (!isStarted || completed || !flashcards.length) return;

    setIsFlipped(false);
    setFeedback(null);
    setUserAnswer("");
    setTimeLeft(15);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(sec => {
        if (sec <= 1) {
          clearInterval(timerRef.current);
          // CONDITION B1: Time limit exceeds - mark as not memorized
          handleTimeout();
          return 0;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isStarted, completed, flashcards]);

  const markWrong = async (card) => {
    try {
        console.log("Marking card as not-memorized:", card.question);
        const response = await fetch(`${API}/flashcards/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                folderId: card.folderId,
                index: card.index,
                status: "not-memorized", // Make sure this matches the enum
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to mark card');
        }
        
        const result = await response.json();
        console.log("Marked as not-memorized:", result);
    } catch (err) {
        console.error("Error marking wrong", err);
    }
};
  // Handle timeout - CONDITION B1
  const handleTimeout = async () => {
    const card = flashcards[currentIndex];
    if (!card) return;
    
    console.log("Time limit exceeded - marking as not memorized");
    await markWrong(card);
    setFeedback("timeout");
    setIsFlipped(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearInterval(timerRef.current);

    const card = flashcards[currentIndex];
    const correct = card.answer.trim().toLowerCase();
    const typed = userAnswer.trim().toLowerCase();

    if (typed === correct) {
      setFeedback("correct");
    } else {
      // CONDITION B2: Answer is wrong - mark as not memorized
      console.log("Wrong answer - marking as not memorized");
      setFeedback("wrong");
      await markWrong(card);
    }

    setIsFlipped(true);
  };

  const nextCard = () => {
    if (currentIndex + 1 >= flashcards.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const startReview = () => {
    setIsStarted(true);
    setCompleted(false);
    setCurrentIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setIsFlipped(false);
  };

  const startOver = () => {
    setIsStarted(false);
    setCompleted(false);
    setCurrentIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setIsFlipped(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const endReview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCompleted(true);
    setIsStarted(false);
  };

  if (!user) return <p>Loading...</p>;
  if (!flashcards.length) return <p>No flashcards found.</p>;

  const card = flashcards[currentIndex];

  return (
    <div className="typing-review-container">
      {!isStarted ? (
        <div className="start-screen">
          <h2 className="name">Typing Mode</h2>
          <p className="sentence">You have {flashcards.length} cards to review</p>
          <button className="start-btn" onClick={startReview}>
            Start Review
          </button>
        </div>
      ) : completed ? (
        <div className="completed-screen">
          <h2>Review Completed!</h2>
          <p>You've reviewed all {flashcards.length} cards</p>
          <div className="completed-buttons">
            <button className="start-over-btn" onClick={startOver}>
              Start Over
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="typing-card-counter-top">
            <div className="card-count">Card {currentIndex + 1} of {flashcards.length}</div>
            <div className="typing-timer">Time left: {timeLeft}s</div>
          </div>

          <div className={`Rev-card ${isFlipped ? "flipped" : ""}`}>
            <div className="inner">
              {/* FRONT SIDE */}
              <div className="front">
                <div className="card-content">
                  <p className="question">{card.question}</p>
                  
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="answer-input"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      rows="4"
                      disabled={feedback}
                    />
                    
                    {!feedback && (
                      <button type="submit" className="submit-btn">
                        Submit Answer
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="back">
                <div className="card-content">
                  <p className="answer-label">Your Answer:</p>
                  <p className="user-answer">"{userAnswer || "—"}"</p>

                  <p className="answer-label">Correct Answer:</p>
                  <p className="answer-text">{card.answer}</p>

                  {feedback === "correct" && (
                    <p className="feedback-correct">✔ Correct!</p>
                  )}
                  {feedback === "wrong" && (
                    <p className="feedback-wrong">✖ Wrong</p>
                  )}
                  {feedback === "timeout" && (
                    <p className="feedback-timeout">⏱ Time's Up</p>
                  )}

                  <button onClick={nextCard} className="back-btn">
                    {currentIndex + 1 < flashcards.length ? "Next →" : "Finish"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="typing-meta-controls">
            <button className="end-btn" onClick={endReview}>
              End Review
            </button>
            <button className="start-over-btn" onClick={startOver}>
              Start Over
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Typing;