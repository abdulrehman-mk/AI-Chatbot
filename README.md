# AI Chatbot — Next.js + FastAPI + Gemini API

A full-stack AI chatbot. Users type a message in the frontend, the message is sent to a FastAPI backend, the backend calls the Google Gemini API, and the AI's reply is shown back in the chat UI.

## Features

- Clean, modern chat interface with message bubbles
- Send messages by clicking "Send" or pressing Enter
- Loading indicator while waiting for the AI reply
- Error handling with user-friendly messages
- Clear Chat button
- Environment-variable based configuration (no hardcoded keys or URLs)
- CORS-enabled FastAPI backend

## Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** Python, FastAPI
- **AI Model:** Google Gemini API (`google-generativeai`)
- **Styling:** Plain CSS

## Project Structure

```
project-root/
  frontend/
    app/
      layout.js
      page.js
      globals.css
    package.json
    next.config.js
    .env.local
  backend/
    main.py
    requirements.txt
    .env
```

