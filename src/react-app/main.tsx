import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ZeroProvider } from "@rocicorp/zero/react";
import Cookies from "js-cookie";
import { schema } from "../shared/schema.js";
import { queries } from "../shared/queries.js";
import { must } from "../shared/must.js";
import { AUTH_COOKIE_NAME } from "../shared/auth.js";
import { mutators } from "../shared/mutators.js";
import "./index.css";
import App from "./App.tsx";

const cacheURL = must(
  import.meta.env.VITE_PUBLIC_ZERO_CACHE_URL,
  "required env var VITE_PUBLIC_ZERO_CACHE_URL"
);

const signedCookie = Cookies.get(AUTH_COOKIE_NAME);
const context = signedCookie
  ? { userID: signedCookie.split(".")[0] }
  : undefined;
const userID = context?.userID ?? null;

const zeroOptions = {
  userID,
  cacheURL,
  schema,
  queries,
  mutators,
  context,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ZeroProvider {...zeroOptions}>
      <App />
    </ZeroProvider>
  </StrictMode>
);
