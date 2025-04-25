import React, { useEffect, useState } from 'react';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const BASE_URL = process.env.REACT_APP_API_URL || 'https://book-notes-backend-bc06.onrender.com'; // Use your actual Render backend URL

  // Load all notes on page load
  useEffect(() => {
    fetch(`${BASE_URL}/notes`)
      .then(res => res.json())
      .then(data => {
        console.log("All notes loaded:", data);
        setNotes(data);
      })
      .catch(err => console.error("Error loading notes:", err));
  }, []);

  // Fetch note content by ID
  const fetchNoteContent = (id) => {
    if (!id) {
      console.warn("Invalid note ID passed to fetchNoteContent:", id);
      return;
    }

    console.log("Fetching content for note ID:", id);
    fetch(`${BASE_URL}/notes/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched note content:", data);
        setSelectedNote(data.content);
      })
      .catch(err => console.error("Error fetching note content:", err));
  };

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    console.log("Searching for:", searchQuery);
    fetch(`${BASE_URL}/search?q=${searchQuery}`)
      .then(res => res.json())
      .then(data => {
        console.log("Search results:", data.results);
        setSearchResults(data.results || []);
      })
      .catch(err => console.error("Search error:", err));
  };

  // List rendering helper
  const renderNoteList = (noteList) => (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {noteList.map(note => (
        <li
          key={note.id}
          onClick={() => {
            console.log("Note clicked:", note);
            fetchNoteContent(note.id);
          }}
          style={{ cursor: 'pointer', marginBottom: '10px' }}
        >
          {note.title}
        </li>
      ))}
    </ul>
  );

  // Highlight search terms in selected note content
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase()
        ? <mark key={i}>{part}</mark>
        : part
    );
  };

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      {/* Sidebar for search and results */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', paddingRight: '20px' }}>
        <h2>Search Notes</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Enter search query"
          style={{ width: '100%', padding: '10px' }}
        />
        <button onClick={handleSearch} style={{ marginTop: '10px', padding: '10px' }}>
          Search
        </button>

        {searchQuery && searchResults.length > 0 && (
          <>
            <h3>Search Results</h3>
            {renderNoteList(searchResults)}
          </>
        )}
      </div>

      {/* All notes list */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '0 20px' }}>
        <h2>All Notes</h2>
        {renderNoteList(notes)}
      </div>

      {/* Note content display */}
      <div style={{ flex: 1, paddingLeft: '20px' }}>
        <h2>Note Content</h2>
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {selectedNote ? highlightText(selectedNote, searchQuery) : "Click a note title to view its content."}
        </div>
      </div>
    </div>
  );
}

export default App;
