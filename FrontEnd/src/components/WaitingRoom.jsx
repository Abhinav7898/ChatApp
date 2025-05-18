import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "../css/WaitingRoom.css";

export default function WaitingRoom({ setConnection, setRoomId }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [chatRoom, setChatRoom] = useState("");

  const handleBtnClick = async (event) => {
    event.preventDefault();

    if (!firstName || !lastName || !chatRoom) {
      alert("Please fill in all fields");
      return;
    }

    // Save user details in session storage
    const fullName = `${firstName} ${lastName}`;
    sessionStorage.setItem("user", fullName);

    // Connect to SignalR
    const conn = new HubConnectionBuilder()
      .withUrl("https://localhost:7130/Chat")
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    try {
      await conn.start();
      console.log("Connected to SignalR");

      const userConnection = {
        userName: fullName,
        chatRoom: chatRoom
      };

      // Join the specific chat room
      await conn.invoke("JoinSpecificChatRoom", userConnection);
      console.log("Joined chat room:", chatRoom);
      
      setConnection(conn);
      setRoomId(chatRoom);
      navigate("/chatRoom");
    } catch (ex) {
      console.error("Error connecting to SignalR:", ex);
    }
  };

  return (
    <div className="waitingroom-container">
      <div className="waitingroom-content">
        <h1>Welcome to Burp Chat 💬</h1>
        <form className="form-container" onSubmit={handleBtnClick}>
          <label htmlFor="UserFirstName">First Name</label>
          <input
            type="text"
            name="UserFirstName"
            id="UserFirstName"
            required
            maxLength={20}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label htmlFor="UserLastName">Last Name</label>
          <input
            type="text"
            name="UserLastName"
            id="UserLastName"
            required
            maxLength={20}
            onChange={(e) => setLastName(e.target.value)}
          />
          <label htmlFor="ChatRoom">Room Id</label>
          <input
            type="text"
            name="ChatRoom"
            id="ChatRoom"
            required
            maxLength={10}
            onChange={(e) => setChatRoom(e.target.value)}
          />
          <button>Join Room</button>
        </form>
      </div>
    </div>
  );
}
