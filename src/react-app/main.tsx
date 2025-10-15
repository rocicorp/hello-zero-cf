import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ZeroProvider } from "@rocicorp/zero/react";
import Cookies from "js-cookie";
import { schema } from "../shared/schema.js";
import { queries } from "../shared/queries.js";
import { must } from "../shared/must.js";
import { AUTH_COOKIE_NAME } from "../shared/auth.js";
import { createMutators } from "../shared/mutators.js";
import "./index.css";
import App from "./App.tsx";

const server = must(
  import.meta.env.VITE_PUBLIC_SERVER_URL,
  "required env var VITE_PUBLIC_SERVER_URL"
);

const signedCookie = Cookies.get(AUTH_COOKIE_NAME);
const userID = signedCookie && signedCookie.split(".")[0];

const zeroOptions = {
  userID: userID ?? "anon",
  server,
  schema,
  queries,
  mutators: createMutators(userID),
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ZeroProvider {...zeroOptions}>
      <App />
    </ZeroProvider>
  </StrictMode>
);
