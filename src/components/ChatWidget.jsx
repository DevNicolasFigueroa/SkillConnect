import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const ChatWidget = ({ isOpen, onClose, professionalName, serviceTitle }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensaje inicial automático
      const initialMessage = {
        id: 1,
        sender: 'system',
        text: `¡Hola! Estás contactando a ${professionalName} sobre el servicio: "${serviceTitle}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const proWelcome = {
        id: 2,
        sender: 'pro',
        text: `Hola ${profile?.full_name || 'qué tal'}, gracias por tu interés en mi servicio de ${serviceTitle}. ¿En qué puedo ayudarte hoy?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([initialMessage, proWelcome]);
    }
  }, [isOpen, professionalName, serviceTitle, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simular respuesta automática después de 1s
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        sender: 'pro',
        text: '¡Entendido! Déjame revisar los detalles y te respondo en unos momentos.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  return (
    <div className="chat-widget-container animate-in">
      <div className="chat-header">
        <div className="chat-pro-info">
          <div className="chat-avatar">
            {professionalName?.charAt(0)}
          </div>
          <div>
            <h4 className="chat-pro-name">{professionalName}</h4>
            <span className="chat-status">En línea</span>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
            <div className={`chat-bubble ${msg.sender}`}>
              <p>{msg.text}</p>
              <span className="chat-time">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn">
          <span>✈️</span>
        </button>
      </form>
    </div>
  );
};
