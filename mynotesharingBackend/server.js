const http = require("http");
const fs = require("fs");
const EventEmitter = require("events");
const WebSocket = require("ws");

// Initialize EventEmitter
const noteEvents = new EventEmitter();

// Path to the notes file
const notesFile = "./notes.txt";

// Ensure the file exists
if (!fs.existsSync(notesFile)) {
  fs.writeFileSync(notesFile, "", (err) => {
    if (err) console.error("Error creating file:", err);
  });
}

// Create HTTP Server
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Welcome to the Real-Time Note Sharing Backend");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// Create WebSocket Server
const wss = new WebSocket.Server({ server });

// WebSocket Logic
wss.on("connection", (ws) => {
  // Send existing notes
  const readStream = fs.createReadStream(notesFile, { encoding: "utf8" });
  readStream.on("data", (chunk) => ws.send(chunk));

  // Listen for new notes
  noteEvents.on("newNote", (note) => {
    ws.send(note);
  });

  // Handle client messages
  ws.on("message", (message) => {
    const note = message.toString();
    fs.appendFile(notesFile, note + "\n", (err) => {
      if (err) console.error("Error writing note:", err);
      else noteEvents.emit("newNote", note);
    });
  });
});

// Start server
server.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
