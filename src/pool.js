import { randomUUID } from "crypto";
import { Session } from "./session.js";

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class SessionPool {
  /**
   * @param {import('./proxy.js').ProgrammableProxy} proxy
   * @param {string} entrypoint  path to app.R
   * @param {number} size        number of idle sessions to keep warm
   */
  constructor(proxy, entrypoint, size = 2) {
    this._proxy = proxy;
    this._entrypoint = entrypoint;
    this._size = size;
    /** @type {Session[]} */
    this._idle = [];
    /** @type {Map<string, Session>} token → session */
    this._active = new Map();
    /** @type {Map<string, ReturnType<typeof setTimeout>>} token → TTL timer */
    this._timers = new Map();
  }

  /**
   * Pre-warm `size` sessions on server startup.
   * Errors during warmup are logged but do not throw.
   */
  warm() {
    for (let i = 0; i < this._size; i++) {
      this._startIdle();
    }
  }

  /**
   * Spawn a new headless session and add it to the idle pool.
   * Runs in background — callers do not await this.
   */
  _startIdle() {
    const session = new Session(null, this._proxy, this._entrypoint);
    session
      .initHeadless()
      .then(() => {
        this._idle.push(session);
        console.log(
          `[pool] idle session ready (pool size: ${this._idle.length})`
        );
      })
      .catch((err) => {
        console.error("[pool] failed to start idle session:", err);
        // Retry after a short delay so the pool self-heals
        setTimeout(() => this._startIdle(), 5000);
      });
  }

  /**
   * Assign a session to a user token.
   * Returns the session (may be pre-warmed or null if pool is empty).
   * @param {string} token
   * @returns {Session|null}
   */
  claim(token) {
    // Returning user — hand back existing active session
    if (this._active.has(token)) {
      this._clearTimer(token);
      console.log(`[pool] returning session for token ${token.slice(0, 8)}…`);
      return this._active.get(token);
    }

    // New user — assign an idle session
    if (this._idle.length > 0) {
      const session = this._idle.pop();
      this._active.set(token, session);
      console.log(
        `[pool] claimed idle session for token ${token.slice(0, 8)}… (${this._idle.length} idle remaining)`
      );
      // Always replenish so the next user has a warm session
      this._startIdle();
      return session;
    }

    // Pool depleted — caller must handle cold start
    console.warn("[pool] pool empty, cold start required");
    return null;
  }

  /**
   * Bind a socket to the session for a given token and signal readiness.
   * @param {string} token
   * @param {import('socket.io').Socket} socket
   * @param {string} title
   * @returns {Session|null}
   */
  attach(token, socket, title) {
    const session = this._active.get(token);
    if (!session) return null;
    session.attach(socket, title);
    return session;
  }

  /**
   * Detach the socket and start the TTL timer.
   * The session stays alive so the user can reconnect.
   * @param {string} token
   */
  release(token) {
    const session = this._active.get(token);
    if (!session) return;

    session._socket = null;
    console.log(
      `[pool] released session for token ${token.slice(0, 8)}… (TTL ${SESSION_TTL_MS / 60000} min)`
    );

    const timer = setTimeout(() => {
      this._expire(token);
    }, SESSION_TTL_MS);

    this._timers.set(token, timer);
  }

  /**
   * Destroy a session immediately and remove it from active.
   * Caller should start a cold session itself if needed.
   * @param {string} token
   */
  evict(token) {
    this._clearTimer(token);
    const session = this._active.get(token);
    if (session) {
      session.destroy();
      this._active.delete(token);
    }
    // Replace the lost session in the idle pool
    this._startIdle();
  }

  /**
   * Restart the session for a token: destroy current, create a fresh one
   * attached to the same socket, and return the new Session (already
   * initHeadless()-ed — caller must call session.init() to spawn the process).
   * @param {string} token
   * @param {import('socket.io').Socket} socket
   * @returns {Session}
   */
  replace(token, socket) {
    this._clearTimer(token);
    const old = this._active.get(token);
    if (old) {
      old._socket = null; // detach before destroy to avoid emitting on old socket
      old.destroy();
    }
    const session = new Session(socket, this._proxy, this._entrypoint);
    this._active.set(token, session);
    return session;
  }

  // ── private ───────────────────────────────────────────────────────────────

  _clearTimer(token) {
    const t = this._timers.get(token);
    if (t !== undefined) {
      clearTimeout(t);
      this._timers.delete(token);
    }
  }

  _expire(token) {
    console.log(
      `[pool] TTL expired for token ${token.slice(0, 8)}… — destroying session`
    );
    const session = this._active.get(token);
    if (session) {
      session.destroy();
      this._active.delete(token);
    }
    this._timers.delete(token);
    // Maintain pool size
    this._startIdle();
  }
}
