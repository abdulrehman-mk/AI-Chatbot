"use client";

// Import React hooks
import { useState, useRef, useEffect } from "react";

// Import ReactMarkdown so bot replies can show headings, bold, bullet points, etc.
import ReactMarkdown from "react-markdown";

// Backend URL from .env.local
// If not found, it will use localhost:8000 by default
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Home() {
  // Stores all chat messages
  // Each message object looks like:
  // { sender: "user" | "bot", text: "message text" }
  const [messages, setMessages] = useState([]);

  // Stores the current input typed by the user
  const [input, setInput] = useState("");

  // True while waiting for bot response from backend
  const [loading, setLoading] = useState(false);

  // Stores error message if API call fails
  const [error, setError] = useState("");

  // Reference used for auto-scrolling to latest message
  const chatEndRef = useRef(null);

  // Whenever messages change or loading changes,
  // scroll to the bottom of the chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Function to send user message to backend
  const sendMessage = async () => {
    // Remove extra spaces from input
    const trimmed = input.trim();

    // Stop if input is empty or already waiting for response
    if (!trimmed || loading) return;

    // Create user message object
    const userMessage = { sender: "user", text: trimmed };

    // Show user message immediately in chat
    setMessages((prev) => [...prev, userMessage]);

    // Clear input box
    setInput("");

    // Clear any old error
    setError("");

    // Show loading state
    setLoading(true);

    try {
      // Send POST request to FastAPI backend
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send user message in JSON format
        body: JSON.stringify({ message: trimmed }),
      });

      // If backend returns error
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Something went wrong. Please try again."
        );
      }

      // Read JSON response from backend
      const data = await response.json();

      // Create bot message using backend reply
      const botMessage = { sender: "bot", text: data.reply };

      // Add bot reply to chat
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      // Show error if request fails
      setError(err.message || "Failed to reach the server.");
    } finally {
      // Stop loading whether success or fail
      setLoading(false);
    }
  };

  // Allow sending message with Enter key
  // Shift + Enter can be used later if textarea is used
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // stop default Enter behavior
      sendMessage();
    }
  };

  // Clear all chat messages and errors
  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="page">
      <div className="chat-container">
        {/* Header section */}
        <div className="chat-header">
          <h1>🤖 AI Chatbot</h1>
          <button className="clear-btn" onClick={clearChat}>
            Clear Chat
          </button>
        </div>

        {/* Chat messages area */}
        <div className="chat-box">
          {/* Show welcome text if no messages yet */}
          {messages.length === 0 && (
            <p className="empty-state">Say hi to start the conversation 👋</p>
          )}

          {/* Loop through all messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`bubble ${
                msg.sender === "user" ? "user-bubble" : "bot-bubble"
              }`}
            >
              {/* If bot message, render Markdown nicely */}
              {msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                // If user message, show plain text
                <p>{msg.text}</p>
              )}
            </div>
          ))}

          {/* Show loading bubble while waiting for backend reply */}
          {loading && <div className="bubble bot-bubble loading">Thinking...</div>}

          {/* Invisible div for auto-scroll */}
          <div ref={chatEndRef} />
        </div>

        {/* Error message */}
        {error && <p className="error-text">⚠ {error}</p>}

        {/* Input area */}
        <div className="input-area">
          <input
            type="text"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}