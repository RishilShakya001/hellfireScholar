import { useState, useEffect, useRef } from "react";
import { getAllSubjects } from "../services/subjectApi";
import { getNotesBySubject } from "../services/noteApi";
import {
  askQuestion,
  getConversations,
  getConversationById,
  deleteConversation,
} from "../services/aiApi";

export default function AiAssistant() {
  // Page states
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedNote, setSelectedNote] = useState("");
  
  // Chat / history states
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  // Fetch all subjects on mount
  useEffect(() => {
    getAllSubjects()
      .then((res) => {
        setSubjects(res.data.data || []);
      })
      .catch((err) => {
        console.error("Failed to load subjects:", err);
        setError("Could not load subjects. Please check connection.");
      });
  }, []);

  // Fetch notes when subject changes
  useEffect(() => {
    if (selectedSubject) {
      getNotesBySubject(selectedSubject)
        .then((res) => {
          setNotes(res.data.data || []);
        })
        .catch((err) => console.error("Failed to load notes:", err));
      
      // Load previous conversation history for this subject
      loadConversationsList(selectedSubject);
    } else {
      setNotes([]);
      setConversations([]);
    }
    // Reset current active chat on subject change
    setCurrentConversationId(null);
    setMessages([]);
  }, [selectedSubject]);

  // Load list of past conversations
  const loadConversationsList = async (subjectId) => {
    try {
      setHistoryLoading(true);
      const res = await getConversations(subjectId);
      setConversations(res.data.data || []);
    } catch (err) {
      console.error("Failed to load conversation history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Select and load a past conversation thread
  const handleSelectConversation = async (id) => {
    try {
      setLoading(true);
      const res = await getConversationById(id);
      if (res.data.data) {
        setMessages(res.data.data.messages || []);
        setCurrentConversationId(id);
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
      alert("Failed to load conversation thread.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a conversation thread
  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation(); // Avoid triggering select conversation
    if (!confirm("Are you sure you want to delete this chat history?")) return;

    try {
      await deleteConversation(id);
      if (currentConversationId === id) {
        setMessages([]);
        setCurrentConversationId(null);
      }
      // Reload list
      loadConversationsList(selectedSubject);
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Failed to delete conversation.");
    }
  };

  // Start a fresh chat session
  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  // Send question message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      alert("Please select a Subject first!");
      return;
    }
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Optimistically push user message to UI
    const optimisticMessage = { role: "user", content: userMessage, createdAt: new Date() };
    setMessages((prev) => [...prev, optimisticMessage]);
    setLoading(true);
    setError("");

    try {
      const res = await askQuestion({
        question: userMessage,
        subjectId: selectedSubject,
        noteId: selectedNote || undefined,
        conversationId: currentConversationId || undefined,
      });

      if (res.data.success) {
        const { answer, sources, conversationId } = res.data.data;
        
        // Push AI message to UI
        const assistantMessage = { role: "assistant", content: answer, sources, createdAt: new Date() };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Set conversation ID for subsequent messages
        if (!currentConversationId) {
          setCurrentConversationId(conversationId);
          loadConversationsList(selectedSubject);
        }
      }
    } catch (err) {
      console.error("Error asking question:", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to open source PDF note in new tab
  const handleOpenSource = (source) => {
    const matchedNote = notes.find((n) => n._id === source.noteId);
    if (matchedNote && matchedNote.fileUrl) {
      window.open(matchedNote.fileUrl, "_blank");
    } else {
      alert(`Source file is not a PDF or has been deleted. Title: ${source.documentTitle}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 min-h-[calc(100vh-4rem)] border rounded-2xl overflow-hidden shadow-sm">
      
      {/* LEFT SIDEBAR: Chat History List */}
      <aside className="w-full md:w-64 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <button
            onClick={handleNewChat}
            disabled={!selectedSubject}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow shadow-sky-500/20"
          >
            ➕ New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[250px] md:max-h-none">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            History Threads
          </h4>

          {!selectedSubject ? (
            <p className="text-xs text-slate-400 text-center py-8">
              Select a subject to view chat history.
            </p>
          ) : historyLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No conversations found.
            </p>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleSelectConversation(chat._id)}
                className={`group flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition ${
                  currentConversationId === chat._id
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className="truncate pr-2">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(e, chat._id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-600 p-1 rounded transition text-xs"
                  title="Delete Thread"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* RIGHT SIDEBAR: Live AI Chat Window */}
      <main className="flex-1 flex flex-col bg-slate-50 relative min-h-[400px]">
        {/* Header Configuration */}
        <header className="p-4 bg-white border-b flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              🤖 AI Study Assistant
            </h3>
            <p className="text-xs text-slate-400">Ask anything grounded in your study material.</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* Subject Selector */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedNote("");
              }}
              className="px-3.5 py-2 border rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition"
            >
              <option value="">Select Subject ▼</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Note Selector */}
            <select
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
              disabled={!selectedSubject || notes.length === 0}
              className="px-3.5 py-2 border rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition disabled:opacity-50"
            >
              <option value="">All Documents</option>
              {notes.map((n) => (
                <option key={n._id} value={n._id}>
                  📄 {n.title} ({n.fileUrl ? "PDF" : "Text"})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Message Container List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[500px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <span className="text-5xl mb-3">🎓</span>
              <h4 className="font-bold text-slate-700 text-base">Start your Study Session</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Select a subject, and ask questions about your course materials, formulas, summaries, or units.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3.5 shadow-sm text-sm border ${
                    msg.role === "user"
                      ? "bg-sky-600 text-white border-sky-600 rounded-br-none"
                      : "bg-white text-slate-800 border-slate-100 rounded-bl-none"
                  }`}
                >
                  {/* Content markup rendering */}
                  <div className="whitespace-pre-wrap leading-relaxed font-medium">
                    {msg.content}
                  </div>

                  {/* Sources display */}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        Sources Used:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => handleOpenSource(src)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 font-semibold border border-slate-200 rounded-lg text-xs transition cursor-pointer"
                          >
                            📄 {src.documentTitle} (Page {src.pageNumber})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Inline Loading State */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 max-w-[80%] rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                <span className="text-xs text-slate-400 font-semibold">AI is analyzing notes...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input box form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-3 shadow-md">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!selectedSubject || loading}
            placeholder={
              selectedSubject
                ? "Ask a question about your study materials..."
                : "Select a Subject from the header to start..."
            }
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-sky-500 text-sm font-semibold transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!selectedSubject || !inputMessage.trim() || loading}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow shadow-sky-500/20"
          >
            Send
          </button>
        </form>
      </main>

    </div>
  );
}
