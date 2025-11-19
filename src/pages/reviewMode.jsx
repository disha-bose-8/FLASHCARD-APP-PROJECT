import React, { useState, useEffect } from "react";
import "../css/reviewMode.css";
import { useOutletContext, useNavigate } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/api`;

function ReviewMode() {
	const [user, setUser] = useState(null);
	const [folders, setFolders] = useState([]);
	const [selectedFolders, setSelectedFolders] = useState([]);
	const [step, setStep] = useState(0);
	const [loading, setLoading] = useState(true);

	const outletContext = useOutletContext();
	const setPageTitle = outletContext?.setPageTitle || (() => {});
	const navigate = useNavigate();

	// Load user
	useEffect(() => {
		setPageTitle("Review Mode");
		try {
			const userData = localStorage.getItem("user");
			if (userData) setUser(JSON.parse(userData));
		} catch (error) {
			console.error("Error loading user:", error);
		}
	}, []);

	// Load folders when user changes (FIXED)
	useEffect(() => {
		if (!user) return;

		async function loadFolders() {
			try {
				setLoading(true);
				const res = await fetch(`${API}/folders/${user._id}`);
				if (!res.ok) throw new Error("Failed to fetch folders");
				const data = await res.json();
				console.log("Loaded folders:", data);
				setFolders(data || []);
			} catch (err) {
				console.error("Error loading folders:", err);
				setFolders([]);
			} finally {
				setLoading(false);
			}
		}

		loadFolders();
	}, [user]); // FIXED HERE

	// Select folder
	const toggleFolder = (id) => {
		setSelectedFolders((prev) =>
			prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
		);
	};

	// Go to next step
	const proceedToMode = () => {
		if (selectedFolders.length === 0) return;
		setStep(1);
	};

	// Choose mode
	const handleModeSelect = (mode) => {
    sessionStorage.setItem("reviewFolders", JSON.stringify(selectedFolders));
    if (mode === "swipe") navigate("/login/home/review/swipe");
    else if (mode === "typing") navigate("/login/home/review/typing");
};
	// STEP 0 — Folder selection
	if (step === 0) {
		return (
			<div className="review-container">
				<h2 className="review-title">Select Folders to Review</h2>

				{loading ? (
					<p>Loading folders...</p>
				) : folders.length === 0 ? (
					<div>
						<p>No folders found.</p>
						<p className="hint">Create folders in "My Flashcards" first!</p>
					</div>
				) : (
					<>
						<div className="folder-select-list">
							{folders.map((folder) => (
								<label
									key={folder._id}
									className={`folder-select-item${
										selectedFolders.includes(folder._id) ? " selected" : ""
									}`}
								>
									<input
										type="checkbox"
										checked={selectedFolders.includes(folder._id)}
										onChange={() => toggleFolder(folder._id)}
									/>
									<span>
										{folder.name} ({folder.flashcards?.length || 0} cards)
									</span>
								</label>
							))}
						</div>

						<button
							className="proceed-btn"
							disabled={selectedFolders.length === 0}
							onClick={proceedToMode}
						>
							Next: Choose Mode ({selectedFolders.length} folder
							{selectedFolders.length !== 1 ? "s" : ""} selected)
						</button>
					</>
				)}
			</div>
		);
	}

	// STEP 1 — Mode selection
	if (step === 1) {
		const totalCards = folders
			.filter((folder) => selectedFolders.includes(folder._id))
			.reduce((sum, folder) => sum + (folder.flashcards?.length || 0), 0);

		return (
			<div className="review-container">
				<h2 className="review-title">Choose Review Mode</h2>

				<p className="selection-info">
					Selected {selectedFolders.length} folder
					{selectedFolders.length !== 1 ? "s" : ""} • {totalCards} cards total
				</p>

				<div className="mode-select-list">
					<button className="mode-btn swipe-mode" onClick={() => handleModeSelect("swipe")}>
						<div className="mode-title">Swipe Mode</div>
						<div className="mode-desc">Flip cards and swipe to answer</div>
					</button>

					<button className="mode-btn typing-mode" onClick={() => handleModeSelect("typing")}>
						<div className="mode-title">Typing Mode</div>
						<div className="mode-desc">Type answers to test recall</div>
					</button>
				</div>

				<button className="back-btn" onClick={() => setStep(0)}>
					⬅ Back to Folder Selection
				</button>
			</div>
		);
	}

	return null;
}

export default ReviewMode;
