import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2, Loader } from "lucide-react";
import { AI_API } from "../../api.js";
import { showError } from "../../utils/errorHandler";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const response = await AI_API.getChatHistory();
      const history = response.data || [];
      
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message if no history
        setMessages([
          {
            id: Date.now(),
            text: "Xin chào! Tôi là trợ lý AI của hệ thống Tutor Support. Tôi có thể giúp gì cho bạn?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Show welcome message on error
      setMessages([
        {
          id: Date.now(),
          text: "Xin chào! Tôi là trợ lý AI của hệ thống Tutor Support. Tôi có thể giúp gì cho bạn?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await AI_API.chat(inputMessage);
      const data = response.data || {};

      const botMessage = {
        id: Date.now() + 1,
        text: data.message || data.answer || data.response || "Xin lỗi, tôi không hiểu câu hỏi của bạn.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      showError("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch sử chat?")) return;

    try {
      await AI_API.clearChatHistory();
      setMessages([
        {
          id: Date.now(),
          text: "Lịch sử đã được xóa. Tôi có thể giúp gì cho bạn?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error clearing history:", error);
      showError("Không thể xóa lịch sử chat.");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chatbot-float-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <MessageCircle size={20} />
              <span>AI Trợ Lý</span>
            </div>
            <div className="chatbot-header-actions">
              <button
                onClick={handleClearHistory}
                title="Xóa lịch sử"
                className="chatbot-icon-button"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Đóng"
                className="chatbot-icon-button"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                <div className="chatbot-message-content">
                  <p>{msg.text}</p>
                  <span className="chatbot-message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-message-content">
                  <div className="chatbot-typing">
                    <Loader size={16} className="chatbot-spinner" />
                    <span>Đang trả lời...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send-button"
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
