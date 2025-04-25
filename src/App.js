import React, { useEffect, useState } from 'react';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetch('https://fastapi-book-backend.onrender.com/notes') // Make sure backend is on this URL
      .then(res => res.json())
      .then(data => {
        console.log("All notes loaded:", data);
        setNotes(data);
      })
      .catch(err => console.error("Error loading notes:", err));
  }, []);

  const fetchNoteContent = (note_id) => {
    if (!note_id) {
      console.warn("Invalid note ID passed to fetchNoteContent:", note_id);
      return;
    }

    console.log("Fetching content for note ID:", note_id);
    fetch(`https://fastapi-book-backend.onrender.com/notes/${note_id}`) // Note content fetch URL
      .then(res => res.json())
      .then(data => {
        console.log("Fetched note content:", data);
        setSelectedNote(data.content);
      })
      .catch(err => console.error("Error fetching note content:", err));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    console.log("Searching for:", searchQuery);
    fetch(`https://fastapi-book-backend.onrender.com/search?q=${searchQuery}`) // Search fetch URL
      .then(res => res.json())
      .then(data => {
        console.log("Search results:", data.results);
        setSearchResults(data.results || []);
      })
      .catch(err => console.error("Search error:", err));
  };

  const renderNoteList = (noteList) => (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {noteList.map(note => {
        console.log("Note object", note); // Log the note object to verify structure
        return (
          <li
            key={note.note_id} // Use note.note_id instead of note.id
            onClick={() => {
              console.log("Note clicked:", note);
              if (note.note_id) { // Check for note_id instead of id
                fetchNoteContent(note.note_id); // Only call fetch if note_id is valid
              } else {
                console.warn("Note ID is missing or invalid:", note);
              }
            }}
            style={{ cursor: 'pointer', marginBottom: '10px' }}
          >
            {note.title}
          </li>
        );
      })}
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
