import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import WaitingRoom from "./components/WaitingRoom.jsx";
import ChatRoom from "./components/ChatRoom.jsx";
import "./App.css";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

function App() {
  const [connection, setConnection] = useState(null);
  const [roomId, setRoomId] = useState("");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<WaitingRoom setConnection={setConnection} setRoomId={setRoomId} />}
        />
        <Route
          path="/chatRoom"
          element={connection ? <ChatRoom connection={connection} roomId={roomId} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
