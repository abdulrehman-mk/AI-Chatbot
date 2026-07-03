// layout.js
// This is the root layout for our Next.js app.
// Every page in the "app" folder is wrapped inside this layout.

import "./globals.css";

export const metadata = {
  title: "AI Chatbot",
  description: "A simple AI chatbot built with Next.js, FastAPI, and Gemini API",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
