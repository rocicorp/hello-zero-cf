import { type MouseEvent, useState } from "react";
import { formatDate } from "./date";
import { useInterval } from "./use-interval";

// Mock data for UI shell - will be replaced with real Zero queries later
const mockUsers = [
  { id: "ycD76wW4R2", name: "Aaron", partner: true },
  { id: "IoQSaxeVO5", name: "Matt", partner: true },
  { id: "WndZWmGkO4", name: "Cesar", partner: true },
];

const mockMessages = [
  {
    id: "1",
    senderID: "ycD76wW4R2",
    body: "Hey guys, is the zero package ready yet?",
    timestamp: Date.now() - 3600000,
    sender: { id: "ycD76wW4R2", name: "Aaron", partner: true },
  },
  {
    id: "2",
    senderID: "IoQSaxeVO5",
    body: "It will be ready next week",
    timestamp: Date.now() - 1800000,
    sender: { id: "IoQSaxeVO5", name: "Matt", partner: true },
  },
];

function App() {
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [action, setAction] = useState<"add" | "remove" | undefined>(undefined);

  // Mock user - will be replaced with real auth later
  const currentUser = "anon";
  const users = mockUsers;
  const allMessages = mockMessages;
  const filteredMessages = mockMessages;

  const hasFilters = filterUser || filterText;

  useInterval(
    () => {
      if (!handleAction()) {
        setAction(undefined);
      }
    },
    action !== undefined ? 1000 / 60 : null,
  );

  const handleAction = () => {
    if (action === undefined) {
      return false;
    }
    if (action === "add") {
      console.log("Add message");
      return true;
    } else {
      console.log("Remove message");
      return true;
    }
  };

  const addMessages = () => setAction("add");

  const removeMessages = (e: MouseEvent) => {
    if (currentUser === "anon" && !e.shiftKey) {
      alert(
        "You must be logged in to delete. Hold the shift key to try anyway.",
      );
      return;
    }
    setAction("remove");
  };

  const stopAction = () => setAction(undefined);

  const editMessage = (
    e: MouseEvent,
    id: string,
    senderID: string,
    prev: string,
  ) => {
    if (senderID !== currentUser && !e.shiftKey) {
      alert(
        "You aren't logged in as the sender of this message. Editing won't be permitted. Hold the shift key to try anyway.",
      );
      return;
    }
    const body = prompt("Edit message", prev);
    console.log("Edit message", id, body);
  };

  const toggleLogin = async () => {
    console.log("Toggle login");
  };

  const user = currentUser;

  return (
    <>
      <div className="controls">
        <div>
          <button onMouseDown={addMessages} onMouseUp={stopAction}>
            Add Messages
          </button>
          <button onMouseDown={removeMessages} onMouseUp={stopAction}>
            Remove Messages
          </button>
          <em>(hold buttons to repeat)</em>
        </div>
        <div
          style={{
            justifyContent: "end",
          }}
        >
          {user === "anon" ? "" : `Logged in as ${user}`}
          <button onMouseDown={() => toggleLogin()}>
            {user === "anon" ? "Login" : "Logout"}
          </button>
        </div>
      </div>
      <div className="controls">
        <div>
          From:
          <select
            onChange={(e) => setFilterUser(e.target.value)}
            style={{ flex: 1 }}
          >
            <option key={""} value="">
              Sender
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          Contains:
          <input
            type="text"
            placeholder="message"
            onChange={(e) => setFilterText(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>
      <div className="controls">
        <em>
          {!hasFilters ? (
            <>Showing all {filteredMessages.length} messages</>
          ) : (
            <>
              Showing {filteredMessages.length} of {allMessages.length}{" "}
              messages. Try opening{" "}
              <a href="/" target="_blank">
                another tab
              </a>{" "}
              to see them all!
            </>
          )}
        </em>
      </div>
      {filteredMessages.length === 0 ? (
        <h3>
          <em>No posts found 😢</em>
        </h3>
      ) : (
        <table border={1} cellSpacing={0} cellPadding={6} width="100%">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Message</th>
              <th>Sent</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((message) => (
              <tr key={message.id}>
                <td align="left">{message.sender?.name}</td>
                <td align="left">{message.body}</td>
                <td align="right">{formatDate(message.timestamp)}</td>
                <td
                  onMouseDown={(e) =>
                    editMessage(e, message.id, message.senderID, message.body)
                  }
                >
                  ✏️
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default App;
