import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ZeroProvider } from "@rocicorp/zero/react";
import { schema } from "../shared/schema.js";
import { queries } from "../shared/queries.js";
import { must } from "../shared/must.js";
import "./index.css";
import App from "./App.tsx";

const server = must(
  import.meta.env.VITE_PUBLIC_SERVER_URL,
  "required env var VITE_PUBLIC_SERVER_URL"
);

const zeroOptions = {
  userID: "anon",
  server,
  schema,
  queries,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ZeroProvider {...zeroOptions}>
      <App />
    </ZeroProvider>
  </StrictMode>
);
