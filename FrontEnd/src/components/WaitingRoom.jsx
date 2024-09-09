import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

export default function WaitingRoom({JoinChatRoom}) {
  const [userName, setUserName] = useState();
  const [chatRoom, setChatRoom] = useState();

  function HandleSumit(e){
    e.preventDefault();
    JoinChatRoom(userName, chatRoom);
  }
  return (
    <Form onSubmit={(e) => HandleSumit(e)}>
      <Row className="px-5 py-5">
        <Col sm={12}>
            <Form.Group>
                <Form.Control placeholder="UserName" onChange={e=> setUserName(e.target.value)}>
                </Form.Control>
                <Form.Control placeholder="ChatRoom" onChange={e=> setChatRoom(e.target.value)}>
                </Form.Control>
            </Form.Group>
        </Col>
        <Col sm={12}>
            <hr/>
            <Button variant="success" type="submit">Join</Button>
        </Col>
      </Row>
    </Form>
  );
}
