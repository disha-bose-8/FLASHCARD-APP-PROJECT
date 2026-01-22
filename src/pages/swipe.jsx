import React, { useState, useEffect, useRef } from "react";
import "../css/swipe.css";
import { useOutletContext } from "react-router-dom";

const API = "https://flashcard-app-project-u8zp.onrender.com/api";


function Swipe() {
  const [user, setUser] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [swipeClass, setSwipeClass] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState(false);

  const timerRef = useRef(null);
  const outletContext = useOutletContext();
  const setPageTitle = outletContext?.setPageTitle || (() => {});

  // Set page title
  useEffect(() => {
    setPageTitle("Review Mode");
  }, [setPageTitle]);

  // Load user safely
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
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

        // Only include flashcards from selected folders 
        const filtered = data.filter(folder =>
          selectedFolderIds.some(selId => String(selId) === String(folder._id))
        );
        const merged = filtered.flatMap((folder) =>
          folder.flashcards.map((card, idx) => ({
            ...card,
            folderId: folder._id,
            index: idx,
          }))
        );

        setFlashcards(merged || []);
      } catch (error) {
        console.error("Error loading flashcards:", error);
      }
    }

    loadCards();
  }, [user?._id]);

  // Timer logic - ONLY when started and not paused
  useEffect(() => {
    if (!isStarted || isPaused || completed || flashcards.length === 0) return;

    setTimeLeft(5);
    setSwipeClass("");

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Auto mark as wrong when time expires 
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isStarted, isPaused, completed, flashcards]);

 const markWrong = async (card) => {
    if (!card) return;
    try {
        console.log("Marking card as not-memorized:", {
            folderId: card.folderId,
            index: card.index,
            question: card.question
        });
        
        const response = await fetch(`${API}/flashcards/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                folderId: card.folderId,
                index: card.index,
                status: "not-memorized",
            }),
        });
        
        // Get the response text first to see what's coming back
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        if (!response.ok) {
            // Try to parse as JSON, but if it fails, use the text
            let errorMessage = responseText;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || responseText;
            } catch {
                // Already have the text
            }
            throw new Error(`HTTP ${response.status}: ${errorMessage}`);
        }
        
        const result = JSON.parse(responseText);
        console.log("Success:", result);
        return result;
    } catch (error) {
        console.error("Error marking card as wrong:", error);
        throw error; // Re-throw to handle in calling function
    }
};

  const nextCard = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFlipped(false);
    setSwipeClass("");
    
    if (currentIndex + 1 >= flashcards.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  // Handle timeout - CONDITION A2
  const handleTimeout = async () => {
    const card = flashcards[currentIndex];
    if (!card) return;
    
    console.log("Time limit exceeded - marking as not memorized");
    await markWrong(card);
    setSwipeClass("out-left");
    
    setTimeout(() => {
      nextCard();
    }, 420);
  };

  // Handle wrong button click - CONDITION A1
  const handleWrong = async () => {
    const card = flashcards[currentIndex];
    if (!card) return;
    
    console.log("User marked as wrong - marking as not memorized");
    // Animate left
    setSwipeClass("out-left");
    if (timerRef.current) clearInterval(timerRef.current);

    // Mark as not memorized - CONDITION A1
    await markWrong(card);

    // Small delay for animation
    setTimeout(() => {
      nextCard();
    }, 420);
  };

  // Handle right - DO NOT mark as wrong
  const handleRight = async () => {
    const card = flashcards[currentIndex];
    if (!card) return;
    
    // Animate right - NO MARKING AS WRONG
    setSwipeClass("out-right");
    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => {
      nextCard();
    }, 420);
  };

  const toggleFlip = () => {
    if (isStarted && !isPaused && !completed) {
      setIsFlipped((s) => !s);
    }
  };

  const startReview = () => {
    setIsStarted(true);
    setCompleted(false);
    setCurrentIndex(0);
    setIsPaused(false);
  };

  const startOver = () => {
    setIsStarted(false);
    setCompleted(false);
    setCurrentIndex(0);
    setIsPaused(false);
    setIsFlipped(false);
    setSwipeClass("");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePause = () => {
    if (!isStarted || completed) return;
    setIsPaused(!isPaused);
    if (isPaused) {
      // Resume timer
      setTimeLeft(5);
    } else {
      // Pause timer
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const endReview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCompleted(true);
    setIsStarted(false);
  };

  // Keyboard handlers
  useEffect(() => {
    const onKey = (e) => {
      if (!isStarted || isPaused || completed) return;
      
      if (e.key === "j" || e.key === "J") {
        handleWrong(); // CONDITION A1
      } else if (e.key === "l" || e.key === "L") {
        handleRight(); // No marking as wrong
      } else if (e.key === " ") {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isStarted, isPaused, completed, flashcards, currentIndex]);

  if (!user) {
    return (
      <div className="review-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="review-container">
        <p>No flashcards available.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="review-container">
      {!isStarted ? (
        <div className="start-screen">
          <h2 className="name">Review Mode</h2>
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
          <div className="card-counter-top">
            <div className="card-count">Card {currentIndex + 1} of {flashcards.length}</div>
            <div className="timer">{timeLeft}s left</div>
            <div className="pause-indicator">{isPaused ? "⏸ Paused" : "▶ Playing"}</div>
          </div>

          <div className="review-card-wrapper">
            <div
              role="button"
              tabIndex={0}
              className={`review-card modern ${isFlipped ? "flipped" : ""} ${swipeClass}`}
              onClick={toggleFlip}
            >
              <div className="review-card-inner">
                <div className="review-card-front">
                  <p className="card-question">{currentCard?.question}</p>
                </div>
                <div className="review-card-back">
                  <p className="card-answer">{currentCard?.answer}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="review-controls modern-controls">
            <button className="control-btn" onClick={() => { 
              if (currentIndex > 0) setCurrentIndex(i => i - 1); 
            }}>⬅️ Prev</button>
            
            <button className="control-btn wrong" onClick={handleWrong}>
              <span></span> Wrong (J)
            </button>
            
            <button className="control-btn pause" onClick={togglePause}>
              {isPaused ? "▶ Resume (P)" : "⏸ Pause (P)"}
            </button>
            
            <button className="control-btn right" onClick={handleRight}>
              <span></span> Memorized (L)
            </button>
            
            <button className="control-btn" onClick={() => { 
              if (currentIndex < flashcards.length - 1) setCurrentIndex(i => i + 1); 
            }}>Next ➡️</button>
          </div>

          <div className="review-meta-controls">
            <button className="end-btn" onClick={endReview}>
              End Review
            </button>
            <button className="start-over-btn" onClick={startOver}>
              Start Over
            </button>
          </div>

          <div className="hint modern-hint">
            <span>Tip:</span> Tap card to flip. J = wrong, L = memorized, Space = flip, P = pause.
          </div>
        </>
      )}
    </div>
  );
}

export default Swipe;