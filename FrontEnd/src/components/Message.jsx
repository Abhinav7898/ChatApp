import React from "react";
import "../css/Message.css";

export default function Message({ message, additionalClass, logo, userName, date }) {
  return (
    <div className={`message-wrapper ${additionalClass}`}>
      <div className="message-container">
        <div className="logo">{logo}</div>
        <div className="message-info">
          <div className="user-name">{userName}</div>
          <div className="message-date">Today at {date}</div>
        </div>
      </div>
      <div className="message">{message}</div>
    </div>
  );
}
