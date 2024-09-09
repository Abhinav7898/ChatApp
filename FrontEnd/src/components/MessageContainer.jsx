import React from "react";

export default function MessageContainer({ messages }) {
  return (
    <div>
      <table className="striped border">
        <tbody>
          {messages.map((msg, index) => (
            <tr key={`tr-${index}`}>
              <td key={`td-${index}`}>
                {msg.msg} - {msg.userName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
