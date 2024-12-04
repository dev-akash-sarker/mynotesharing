import React, { useState, useEffect } from "react";

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const wsRef = React.useRef(null);

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    // Handle incoming notes
    ws.onmessage = (event) => {
      const note = event.data;
      setNotes((prevNotes) => [...prevNotes, note]);
    };

    // Clean up on component unmount
    return () => ws.close();
  }, []);

  const handleSendNote = () => {
    if (newNote.trim()) {
      wsRef.current.send(newNote);
      setNewNote("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Real-Time Note Sharing</h1>
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        rows="4"
        cols="50"
        placeholder="Write your note here..."
      />
      <br />
      <button onClick={handleSendNote}>Send Note</button>
      <h2>Notes:</h2>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
