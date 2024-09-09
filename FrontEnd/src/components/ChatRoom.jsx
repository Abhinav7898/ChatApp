import React, { useState, useEffect, useRef } from "react";
import "../css/ChatRoom.css";
import Message from "./Message";
import SendIcon from "../img/send.png";

export default function ChatRoom({ connection, roomId }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const chatEndRef = useRef(null);

  useEffect(() => {
    const connect = async () => {
      if (!connection) return;

      try {
        connection.on("ReceiveMessage", (user, msg) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { user, message: msg },
          ]);
        });
      } catch (ex) {
        console.log(ex);
      }
    };

    connect();

    return () => {
      connection?.off("ReceiveMessage");
    };
  }, [connection]);

  useEffect(() => {
    // Scroll to the bottom of the chat section
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    // Timer logic
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          // Handle session end logic here, e.g., redirect to a different page
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    const user = sessionStorage.getItem("user");
    if (!user) return;

    try {
      await connection.invoke("SendMessage", user, message);
      setMessage("");
    } catch (ex) {
      console.log(ex);
    }
  };

  const getInitials = (fullName) => {
    const names = fullName.split(" ");
    if (names.length < 2) return names[0][0].toUpperCase();
    return `${names[0][0].toUpperCase()}${names[1][0].toUpperCase()}`;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div className="chatroom-container">
      <div className="chatroom-content">
        <div className="chatroom-main">
          <h2>Burp Room 💬</h2>
          <p className="room-id">Room ID: {roomId}</p>
          <p>Timing: {formatTime(timeLeft)} Min</p>
        </div>
        <div className="chat-section">
          {messages.map((msg, index) => (
            <Message
              key={index}
              message={msg.message}
              additionalClass={sessionStorage.getItem("user") === msg.user ? "send" : "receive"}
              logo={getInitials(msg.user)}
              userName={msg.user}
              date={new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>
            <img src={SendIcon} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
}
