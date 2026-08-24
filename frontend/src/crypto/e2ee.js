import axios from "axios";

// End-to-end encryption for chat messages.
//
// Scheme: each user has a long-term ECDH (P-256) identity keypair. The
// private key never leaves the browser (stored in IndexedDB); the public
// key is published to the server, which is not secret.
//
// To send a text message to a chat's members, the sender:
//   1. Generates a random one-time AES-256-GCM "message key" and uses it
//      to encrypt the plaintext -> `ciphertext` + `iv`.
//   2. For every member of the chat (including themself, so message
//      history stays readable later), derives a per-pair AES key via
//      ECDH(myPrivateKey, memberPublicKey) and uses it to wrap the raw
//      message key -> one `{ user, encryptedKey }` entry per member.
// The server stores/relays ciphertext + wrapped keys only; it never has
// the plaintext or any private key, so it cannot read message content.
//
// Caveat: the private key lives only in the browser that generated it.
// Logging in on a new device/browser publishes a new public key and
// starts a fresh identity — history encrypted to the old key becomes
// unreadable there. There's no backup/multi-device sync in this scheme.

const ECDH_PARAMS = { name: "ECDH", namedCurve: "P-256" };
const DB_NAME = "e2ee-keystore";
const STORE_NAME = "identities";

const identityCache = new Map();

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: "userId" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(userId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(userId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(record) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const b64 = {
  encode(buf) {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  },
  decode(str) {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  },
};

// Returns { privateKey, publicKeyJwk } for this user, generating and
// persisting a new identity keypair on first use.
export async function getOrCreateIdentity(userId) {
  if (identityCache.has(userId)) return identityCache.get(userId);

  const stored = await idbGet(userId);
  let privateKeyJwk, publicKeyJwk;

  if (stored) {
    ({ privateKeyJwk, publicKeyJwk } = stored);
  } else {
    const keyPair = await crypto.subtle.generateKey(ECDH_PARAMS, true, ["deriveKey"]);
    privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    await idbPut({ userId, privateKeyJwk, publicKeyJwk });
  }

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    ECDH_PARAMS,
    true,
    ["deriveKey"]
  );

  const identity = { privateKey, publicKeyJwk };
  identityCache.set(userId, identity);
  return identity;
}

// Ensures the server has this browser's current public key on file.
// Safe to call on every login/app load; it's a no-op once published.
export async function ensurePublicKeyPublished(user) {
  if (!user?._id || !user?.token) return;

  const { publicKeyJwk } = await getOrCreateIdentity(user._id);
  const publicKeyStr = JSON.stringify(publicKeyJwk);
  if (user.publicKey === publicKeyStr) return;

  await axios.put(
    "/api/user/publickey",
    { publicKey: publicKeyStr },
    { headers: { Authorization: `Bearer ${user.token}` } }
  );
}

async function importPeerPublicKey(publicKeyStr) {
  const jwk = JSON.parse(publicKeyStr);
  return crypto.subtle.importKey("jwk", jwk, ECDH_PARAMS, false, []);
}

async function deriveSharedAesKey(myPrivateKey, peerPublicKey) {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: peerPublicKey },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypts `plaintext` for every recipient (must include the sender),
// each given as { _id, publicKey }. Returns { ciphertext, iv, keys }
// ready to send to the backend.
export async function encryptForRecipients(plaintext, myPrivateKey, recipients) {
  const messageKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    messageKey,
    new TextEncoder().encode(plaintext)
  );
  const rawMessageKey = await crypto.subtle.exportKey("raw", messageKey);

  const keys = [];
  for (const recipient of recipients) {
    const peerPublicKey = await importPeerPublicKey(recipient.publicKey);
    const sharedKey = await deriveSharedAesKey(myPrivateKey, peerPublicKey);
    const wrapIv = crypto.getRandomValues(new Uint8Array(12));
    const wrappedBuf = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: wrapIv },
      sharedKey,
      rawMessageKey
    );
    keys.push({
      user: recipient._id,
      encryptedKey: `${b64.encode(wrapIv)}:${b64.encode(wrappedBuf)}`,
    });
  }

  return { ciphertext: b64.encode(cipherBuf), iv: b64.encode(iv), keys };
}

// Decrypts a message (as returned by the backend, with `sender` populated
// including `publicKey`) using this user's private key. Throws if this
// user has no wrapped key entry or the sender has no public key on file.
export async function decryptMessage(message, myUserId, myPrivateKey) {
  const entry = message.keys?.find((k) => String(k.user) === String(myUserId));
  if (!entry) throw new Error("No encrypted key for this user on this message.");

  const senderPublicKeyStr = message.sender?.publicKey;
  if (!senderPublicKeyStr) throw new Error("Sender has no public key on file.");

  const [wrapIvB64, wrappedB64] = entry.encryptedKey.split(":");
  const peerPublicKey = await importPeerPublicKey(senderPublicKeyStr);
  const sharedKey = await deriveSharedAesKey(myPrivateKey, peerPublicKey);

  const rawMessageKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(b64.decode(wrapIvB64)) },
    sharedKey,
    b64.decode(wrappedB64)
  );
  const messageKey = await crypto.subtle.importKey(
    "raw",
    rawMessageKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(b64.decode(message.iv)) },
    messageKey,
    b64.decode(message.ciphertext)
  );
  return new TextDecoder().decode(plainBuf);
}

// Convenience wrapper for rendering: returns the message with `content`
// set to the decrypted plaintext, falling back gracefully for legacy
// (pre-encryption) messages or ones that fail to decrypt.
export async function decryptForDisplay(message, myUserId, myPrivateKey) {
  if (!message.ciphertext) return message;
  try {
    const content = await decryptMessage(message, myUserId, myPrivateKey);
    return { ...message, content };
  } catch (err) {
    console.error("Failed to decrypt message", message._id, err);
    return { ...message, content: "🔒 Unable to decrypt this message." };
  }
}
