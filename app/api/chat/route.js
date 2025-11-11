/* === LOCKED CHATGPT THEME === */
:root {
  color-scheme: dark;
  --bg: #050509;
  --surface: #1e1f24;
  --input: #2a2b32;
  --border: #2f3138;
  --text: #ececf1;
  --text-secondary: #8e8ea0;
  --accent: #3b82f6;
  --radius: 0.75rem;
  --shadow: 0 0 12px rgba(0, 0, 0, 0.4);
}

html,
body {
  margin: 0;
  height: 100%;
  background: var(--bg) !important;
  color: var(--text);
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
}

header {
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  text-align: center;
  padding: 1rem 0.5rem;
}

header h1 {
  font-size: 1rem;
  font-weight: 500;
  color: #f3f4f6;
}

header p {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin-top: 2rem;
}

button.module-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: var(--text);
  transition: all 0.2s ease;
}
button.module-btn:hover {
  background: var(--input);
  border-color: #4b4b55;
}

.chat-container {
  max-width: 850px;
  width: 100%;
  margin-top: 2rem;
  padding: 0 1rem;
}

.message {
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  box-shadow: var(--shadow);
  white-space: pre-wrap;
  line-height: 1.6;
}

.user {
  background: #2a2b32;
  color: #90b4ff;
}
.coach {
  background: #1e1f24;
  color: var(--text);
}

footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: center;
  z-index: 50;
}

footer form {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 850px;
}

footer input[type="text"] {
  flex: 1;
  background: var(--input);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 9999px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}
footer input::placeholder {
  color: var(--text-secondary);
}

footer button {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 9999px;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s ease;
}
footer button:hover {
  background: #2563eb;
}