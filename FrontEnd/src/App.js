import "./App.css";
import { Row, Col, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import WaitingRoom from "./components/WaitingRoom";
import ChatRoom from "./components/ChatRoom"
import { useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
function App() {
  const [conn, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const JoinChatRoom = async (userName, chatRoom) => {
    try {
      debugger
      // initiate a connection
      const conn = new HubConnectionBuilder()
        .withUrl("https://localhost:7130/chat") // Ensure this matches exactly, including case sensitivity
        // .configureLogging(LogLevel.Information)
        .build();
      // set up handlers
      conn.on("JoinSpecificChatRoom", (userName, msg) => {
        // console.log("msg: ", msg);
        setMessages((messages) => [...messages, { userName, msg }]);
      });

      conn.on("ReceiveSpecificMessage", (userName, msg) => {
        setMessages((messages) => [...messages, { userName, msg }]);
      });

      await conn.start();
      await conn.invoke("JoinSpecificChatRoom", { userName, chatRoom });

      setConnection(conn);
    } catch (ex) {
      console.log(ex);
    }
  };

  const sendMessage = async(message)=>{
    try{
      await conn.invoke("SendMessage", message);
    }
    catch(ex){
      console.log(ex);
    }
  }
  return (
    <div>
      <main>
        <Container>
          <Row className="px-5 my-5">
            <Col sm="12">
              <h1 className="font-weight-light">Welcome to the ChatApp</h1>
            </Col>
          </Row>
          {!conn ? (
            <WaitingRoom JoinChatRoom={JoinChatRoom} />
          ) : (
            <ChatRoom messages={messages} sendMessage={sendMessage} />
          )}
        </Container>
      </main>
    </div>
  );
}

export default App;
