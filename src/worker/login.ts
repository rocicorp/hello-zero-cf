import { setSignedCookie, getSignedCookie } from "hono/cookie";
import type { Context } from "hono";
import { must } from "../shared/must.js";
import { AUTH_COOKIE_NAME } from "../shared/auth.js";

const userIDs = [
  "ycD76wW4R2",
  "IoQSaxeVO5",
  "WndZWmGkO4",
  "ENzoNm7g4E",
  "dLKecN3ntd",
  "enVvyDlBul",
  "9ogaDuDNFx",
  "6z7dkeVLNm",
  "7VoEoJWEwn",
];

function getSecretKey(c: Context): string {
  return must(c.env.AUTH_SECRET, "required env var AUTH_SECRET");
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export async function handleLogin(c: Context) {
  const secretKey = getSecretKey(c);
  const userID = userIDs[randomInt(userIDs.length)];
  await setSignedCookie(c, AUTH_COOKIE_NAME, userID, secretKey);
  return c.text("ok");
}

export async function getUserID(c: Context): Promise<string | undefined> {
  const secretKey = getSecretKey(c);
  const cookie = await getSignedCookie(c, secretKey, AUTH_COOKIE_NAME);
  if (!cookie) {
    return undefined;
  }
  return cookie;
}
