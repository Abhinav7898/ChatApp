import React from "react";
import "../css/Message.css";

export default function Message({ message, additionalClass, logo, userName, date, isSystemMessage }) {
  if (isSystemMessage) {
    return (
      <div className="message-container system">
        <div className="message-content">
          <p className="system-text">
            <span className="system-user">{userName}</span> {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-container ${additionalClass}`}>
      <div className="logo">
        <p>{logo}</p>
      </div>
      <div className="message-content">
        <p className="user-name">{userName}</p>
        <div className="message-text">
          <p>{message}</p>
          <span className="message-time">{date}</span>
        </div>
      </div>
    </div>
  );
}
