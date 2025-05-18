import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ChatRoom.css";
import Message from "./Message";
import SendIcon from "../img/send.png";

export default function ChatRoom({ connection, setConnection, roomId }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!connection) {
      console.warn("No connection available");
      return;
    }

    console.log("Setting up SignalR event listeners...");

    // Set up message handlers
    connection.on("ReceiveSpecificMessage", (user, msg) => {
      console.log("Received message:", { user, msg });
      setMessages(prevMessages => [...prevMessages, { user, message: msg }]);
    });

    connection.on("JoinSpecificChatRoom", (user, msg) => {
      console.log("User joined:", { user, msg });
      setMessages(prevMessages => [...prevMessages, { 
        user, 
        message: msg,
        isSystemMessage: true 
      }]);
    });

    connection.on("UserLeft", (user, msg) => {
      console.log("User left:", { user, msg });
      setMessages(prevMessages => [...prevMessages, { 
        user, 
        message: msg,
        isSystemMessage: true 
      }]);
    });

    // Connection state handlers
    connection.onreconnecting(() => {
      console.log("Attempting to reconnect...");
    });

    connection.onreconnected(() => {
      console.log("Reconnected to server");
    });

    connection.onclose(() => {
      console.log("Connection closed");
    });

    // Cleanup function
    return () => {
      if (connection) {
        console.log("Cleaning up SignalR event listeners...");
        connection.off("ReceiveSpecificMessage");
        connection.off("JoinSpecificChatRoom");
        connection.off("UserLeft");
      }
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
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLeaveChat = async () => {
    if (!connection) return;

    const user = sessionStorage.getItem("user");
    if (!user) return;

    try {
      await connection.invoke("LeaveChat", user);
      await connection.stop();
      setConnection(null);
      sessionStorage.removeItem("user");
      navigate("/");
    } catch (ex) {
      console.error("Error leaving chat:", ex);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !connection) return;

    const user = sessionStorage.getItem("user");
    if (!user) {
      console.warn("No user found in session storage");
      return;
    }

    try {
      console.log("Sending message:", { user, message });
      await connection.invoke("SendMessage", user, message.trim());
      setMessage("");
    } catch (ex) {
      console.error("Error sending message:", ex);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const names = fullName.split(" ");
    if (names.length < 2) return names[0][0].toUpperCase();
    return `${names[0][0].toUpperCase()}${names[1][0].toUpperCase()}`;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  if (!connection) {
    return <div>Connecting to chat...</div>;
  }

  return (
    <div className="chatroom-container">
      <div className="chatroom-content">
        <div className="chatroom-header">
          <div className="chatroom-main">
            <h2>Burp Room 💬</h2>
            <p className="room-id">Room ID: {roomId}</p>
            <p>Timing: {formatTime(timeLeft)} Min</p>
          </div>
          <button className="leave-button" onClick={handleLeaveChat}>
            Leave Chat
          </button>
        </div>
        <div className="chat-section">
          {messages.map((msg, index) => (
            <Message
              key={index}
              message={msg.message}
              additionalClass={msg.isSystemMessage ? 'system' : (sessionStorage.getItem("user") === msg.user ? "send" : "receive")}
              logo={getInitials(msg.user)}
              userName={msg.user}
              date={new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              isSystemMessage={msg.isSystemMessage}
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
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage}>
            <img src={SendIcon} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
}
