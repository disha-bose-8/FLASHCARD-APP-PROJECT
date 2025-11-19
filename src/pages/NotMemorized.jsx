import React, { useState, useEffect } from "react";
import "../css/NotMemorized.css";
import { MdDelete } from "react-icons/md";
import { useOutletContext} from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/api`;

function NotMemorized() {
    const outletContext = useOutletContext();
    const setPageTitle = outletContext?.setPageTitle || (() => {});

    useEffect(() => {
        setPageTitle("Not memorized");
    }, [setPageTitle]);

    const [user, setUser] = useState(null);
    const [notMemorizedCards, setNotMemorizedCards] = useState([]);

    // Load user
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Load cards
    useEffect(() => {
        if (!user?._id) return;
        
        async function loadNotMemorizedCards() {
            try {
                const res = await fetch(`${API}/flashcards/not-memorized/${user._id}`);
                if (!res.ok) throw new Error('Failed to fetch cards');
                const data = await res.json();
                setNotMemorizedCards(data);
            } catch (err) {
                console.error("Error loading not memorized cards:", err);
            }
        }
        loadNotMemorizedCards();
    }, [user?._id]);

    const deleteCard = async (card, index) => {
        try {
            const response = await fetch(`${API}/flashcards/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folderId: card.folderId,
                    index: card.index,
                    status: "new",
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update card status');
            }

            // Remove from local state
            const updated = [...notMemorizedCards];
            updated.splice(index, 1);
            setNotMemorizedCards(updated);
        } catch (err) {
            console.error("Error updating status", err);
        }
    };

    const clearAllCards = async () => {
        if (!window.confirm("Clear ALL not memorized cards?")) return;

        try {
            const updatePromises = notMemorizedCards.map(card => 
                fetch(`${API}/flashcards/status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        folderId: card.folderId,
                        index: card.index,
                        status: "new",
                    }),
                })
            );

            await Promise.all(updatePromises);
            setNotMemorizedCards([]);
        } catch (err) {
            console.error("Error clearing all", err);
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="not-memorized-container">
            <div className="not-memorized-header">
                

                {notMemorizedCards.length > 0 && (
                    <button className="clear-all-btn" onClick={clearAllCards}>
                        Clear All
                    </button>
                )}
            </div>

            {notMemorizedCards.length === 0 ? (
                <p>No cards marked as not memorized yet.</p>
            ) : (
                <div className="not-memorized-list">
                    {notMemorizedCards.map((card, index) => (
                        <div key={`${card.folderId}-${card.index}`} className="not-memorized-card">
                            <div className="card-content">
                                <div className="card-folder">
                                    <strong></strong> {card.folderName}
                                </div>
                                <div className="card-question">
                                    <strong>Q:</strong> {card.question}
                                </div>
                                <div className="card-answer">
                                    <strong>A:</strong> {card.answer}
                                </div>
                            </div>

                            <button
                                className="delete-card-btn"
                                onClick={() => deleteCard(card, index)}
                            >
                                <MdDelete />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NotMemorized;