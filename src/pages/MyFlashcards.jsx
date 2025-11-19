// src/pages/MyFlashcards.jsx
import React, { useState, useEffect, useRef } from "react";
import "../css/myFlashcards.css";
import "../css/nav.css";
import { IoIosArrowDropleft } from "react-icons/io";
import { CiImport } from "react-icons/ci";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdDelete, MdOutlineModeEdit } from "react-icons/md";
import { useOutletContext } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/api`;

function MyFlashcards() {
  const user = JSON.parse(localStorage.getItem("user"));

  // STATES
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [flippedIndex, setFlippedIndex] = useState(null);
  const [error, setError] = useState("");
  const [sidebarActive, setSidebarActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [fabOpen, setFabOpen] = useState(false);
  const toggleFab = () => setFabOpen(!fabOpen);

  // setPageTitle from layout
  const outletContext = useOutletContext();
  const setPageTitle = outletContext?.setPageTitle || (() => {});

  // sidebar listener
  useEffect(() => {
    const checkSidebar = () => {
      const sidebar = document.querySelector(".nav-menu");
      setSidebarActive(sidebar?.classList.contains("active") || false);
    };
    checkSidebar();
    const interval = setInterval(checkSidebar, 100);
    return () => clearInterval(interval);
  }, []);

  // load folders on mount
  useEffect(() => {
    if (user?._id) loadFolders();
    setPageTitle("My Flashcards");
  }, [user?._id]);

  // **LOAD FOLDERS**
  const loadFolders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/folders/${user._id}`);
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error("Error loading folders", err);
    }
    setLoading(false);
  };

  const openFolder = (id) => {
    const folder = folders.find((f) => f._id === id);
    setSelectedFolder(folder || null);
    setShowForm(false);
    setError("");
    if (folder) setPageTitle(`My Flashcards / ${folder.name}`);
  };

  // **CREATE FOLDER**
  const handleCreateFolder = () => {
    setShowFolderForm(true);
    setNewFolderName("");
    setError("");
  };

  const handleSaveFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      setError("Folder name cannot be empty!");
      return;
    }

    try {
      await fetch(`${API}/folders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, name }),
      });

      await loadFolders();
      setShowFolderForm(false);
    } catch (err) {
      console.error(err);
      setError("Error creating folder.");
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm("Delete this folder and all its flashcards?")) return;

    try {
      await fetch(`${API}/folders/${id}`, { method: "DELETE" });
      await loadFolders();
      setSelectedFolder(null);
      setPageTitle("My Flashcards");
    } catch {
      setError("Error deleting folder");
    }
  };

  // **FLASHCARDS**
  const handleAddClick = () => {
    setQuestion("");
    setAnswer("");
    setEditIndex(null);
    setShowForm(true);
  };

  const handleSaveFlashcard = async () => {
    if (!question.trim() || !answer.trim()) {
      setError("Please fill out both fields!");
      return;
    }

    const folderId = selectedFolder._id;

    try {
      if (editIndex !== null) {
        await fetch(`${API}/flashcards/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folderId,
            index: editIndex,
            question,
            answer,
          }),
        });
      } else {
        await fetch(`${API}/flashcards/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId, question, answer }),
        });
      }

      await refreshSelectedFolder();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Error saving flashcard");
    }
  };

  const handleEditFlashcard = (index) => {
    const card = selectedFolder.flashcards[index];
    setQuestion(card.question);
    setAnswer(card.answer);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDeleteFlashcard = async (index) => {
    try {
      await fetch(`${API}/flashcards/delete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: selectedFolder._id, index }),
      });
      await refreshSelectedFolder();
    } catch (err) {
      console.error(err);
      setError("Error deleting flashcard");
    }
  };

  const refreshSelectedFolder = async () => {
    const updated = await (await fetch(`${API}/folders/${user._id}`)).json();
    const newFolder = updated.find((f) => f._id === selectedFolder._id);
    setFolders(updated);
    setSelectedFolder(newFolder);
  };

  // **CSV IMPORT**
  const handleImportClick = () => {
    if (!selectedFolder) return alert("Open a folder first.");
    fileInputRef.current?.click();
  };

  const parseCSV = (content) => {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const firstLower = lines[0].toLowerCase();
    if (firstLower.includes("question") && firstLower.includes("answer")) {
      lines.shift();
    }

    const cards = [];
    const parseRow = (row) => {
      const result = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '"') {
          if (inQuotes && row[i + 1] === '"') {
            cur += '"';
            i++;
          } else inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
          result.push(cur);
          cur = "";
        } else cur += ch;
      }
      result.push(cur);
      return result;
    };

    for (let line of lines) {
      const parts = parseRow(line);
      if (parts.length >= 2) {
        const q = parts[0].trim().replace(/^"|"$/g, "");
        const a = parts.slice(1).join(",").trim().replace(/^"|"$/g, "");
        if (q && a) cards.push({ question: q, answer: a });
      }
    }
    return cards;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const cards = parseCSV(e.target.result);
        if (!cards.length) {
          setError("Invalid CSV format or no valid cards found.");
          return;
        }

        const res = await fetch(`${API}/flashcards/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: selectedFolder._id, cards }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Import failed on server.");
          return;
        }

        await refreshSelectedFolder();
        alert(data.message || `Imported ${cards.length} flashcards!`);
      } catch {
        setError("Error importing CSV.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  // **FLIP**
  const toggleFlip = (index) => {
    setFlippedIndex(flippedIndex === index ? null : index);
  };

  // ================== UI ==================
  return (
    <div className={`container ${sidebarActive ? "sidebar-active" : ""}`}>
      {/* FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* ========== FOLDER LIST ========== */}
      {!selectedFolder && !showFolderForm && (
        <div className="folder-view" style={{ padding: "2rem 1rem" }}>

          {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

          <div
            className="folder-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              justifyItems: "center",
              width: "100%",
              maxWidth: "1100px",
              margin: "1rem auto 3.5rem auto",
            }}
          >
            {folders.length === 0 && !loading && (
              <p className="empty-msg">No folders yet.</p>
            )}

            {folders.map((folder) => (
              <div
                key={folder._id}
                className="folder-card"
                style={{ width: "100%", maxWidth: 320, position: "relative" }}
              >
                <h3
                  onClick={() => openFolder(folder._id)}
                  style={{ cursor: "pointer", padding: "0.75rem" }}
                >
                  {folder.name}
                </h3>

                <button
                  className="delete-folder"
                  onClick={() => handleDeleteFolder(folder._id)}
                  aria-label={`Delete ${folder.name}`}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <MdDelete size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* CREATE FOLDER FAB */}
          <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 50 }}>
            <div
              className="fab-main"
              onClick={handleCreateFolder}
              style={{
                background: "#2f6ce5",
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                cursor: "pointer",
              }}
              title="Create folder"
            >
              <IoMdAddCircleOutline size={28} color="white" />
            </div>
          </div>
        </div>
      )}

      {/* ========== CREATE FOLDER FORM ========== */}
      {showFolderForm && (
        <div className="add-card">
          <div className="form-container">
            <h3>Create New Folder</h3>

            <input className="input-area"
              type="text"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />

            {error && <p className="error">{error}</p>}

            <div className="btns">
              <button className="save-btn" onClick={handleSaveFolder}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowFolderForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== INSIDE FOLDER ========== */}
      {selectedFolder && !showForm && (
        <>
          {/* FIXED BACK BUTTON */}
          <button
            className="cancel-btn back-btn"
            onClick={() => {
              setSelectedFolder(null);
              setPageTitle("My Flashcards");
            }}
            style={{
              position: "fixed",
              bottom: 20,
              left: 20,
              zIndex: 50,
              padding: "10px 16px"
            }}
          >
            ⬅ Back
          </button>

          {/* FAB MENU */}
          <div className={`fab-wrapper ${fabOpen ? "open" : ""}`}>
            <div
              className="fab-main"
              onClick={toggleFab}
              style={{ position: "fixed", right: 20, bottom: 20, zIndex: 40 }}
            >
              <IoIosArrowDropleft size={38} />
            </div>

            <div
              className="fab-menu"
              style={{ position: "fixed", right: 20, bottom: 86, zIndex: 40 }}
            >
              <div
                className="fab-icon"
                onClick={handleImportClick}
                style={{ marginBottom: 10, cursor: "pointer" }}
              >
                <CiImport size={28} />
                <span className="fab-tooltip">Import CSV</span>
              </div>

              <div
                className="fab-icon"
                onClick={handleAddClick}
                style={{ cursor: "pointer" }}
              >
                <IoMdAddCircleOutline size={30} />
                <span className="fab-tooltip">Add</span>
              </div>
            </div>
          </div>

          <div className="card-list-container">
            {selectedFolder.flashcards.length === 0 && (
              <p>No flashcards in this folder.</p>
            )}

              {selectedFolder.flashcards.map((card, index) => (
                <div key={index} className="flashcard-item">
                                 <div
                          className={`flip-card ${
                              flippedIndex === index ? "flipped" : ""
                          }`}
                          onClick={() => toggleFlip(index)}
                      >
                        <div className="flip-card-inner">
                          <div className="flip-card-front">
                            <p>{card.question}</p>
                          </div>
                          <div className="flip-card-back">
                            <p>{card.answer}</p>
                          </div>
                        </div>
                      </div>

                      <div className="buttons-con">
                        <button
                            className="edit"
                            onClick={() => handleEditFlashcard(index)}
                             style={{
                    position: "absolute",
                    top: 8,
                    right: 1,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                        >
                          <MdOutlineModeEdit size={20} />
                        </button>
                        <button
                            className="delete"
                            onClick={() => handleDeleteFlashcard(index)}
                                        
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 30,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                    >
                          <MdDelete  size={20}/>
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            </>
        )}

      {/* ADD/EDIT FLASHCARD FORM */}
      {showForm && (
        <div className="add-card">
          <div className="form-container">
            <h3>{editIndex !== null ? "Edit Flashcard" : "Add Flashcard"}</h3>

            <textarea
              placeholder="Enter question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows="4"
            />

            <textarea
              placeholder="Enter answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows="4"
            />

            {error && <p className="error">{error}</p>}

            <div className="btns">
              <button className="save-btn" onClick={handleSaveFlashcard}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyFlashcards;
