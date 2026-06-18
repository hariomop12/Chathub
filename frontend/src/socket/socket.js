const LOG_PREFIX = "[WS]";

function getWSURL() {
  const wsUrl = import.meta.env.VITE_WS_URL || "";
  if (wsUrl) {
    return wsUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "";
  if (apiUrl) {
    const url = new URL(apiUrl);
    const proto = url.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${url.host}/ws`;
  }

  if (import.meta.env.DEV) {
    return "ws://localhost:5000/ws";
  }

  const loc = window.location;
  const proto = loc.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${loc.host}/ws`;
}

let socket = null;
let listeners = {};
let reconnectTimer = null;
let ws = null;
let connected = false;
let manualClose = false;

export const connectSocket = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log(`${LOG_PREFIX} connectSocket() called but already open/connecting (readyState=${ws.readyState})`);
    return socket;
  }

  console.log(`${LOG_PREFIX} connectSocket() — creating new connection`);
  connected = false;
  manualClose = false;

  const connect = () => {
    if (manualClose) {
      console.log(`${LOG_PREFIX} connect() skipped — manualClose=true`);
      return;
    }
    const url = getWSURL();
    console.log(`${LOG_PREFIX} connect() — connecting to ${url}`);
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log(`${LOG_PREFIX} ✅ onopen — connection established`);
      connected = true;
      fire("connect");
    };

    ws.onmessage = (event) => {
      console.log(`${LOG_PREFIX} 📩 onmessage — raw:`, event.data.substring(0, 200));
      try {
        const msg = JSON.parse(event.data);
        console.log(`${LOG_PREFIX} 📩 parsed — type="${msg.type}"`, msg.data);
        fire(msg.type, msg.data);
      } catch (e) {
        console.error(`${LOG_PREFIX} ❌ parse error:`, e, "raw:", event.data.substring(0, 200));
      }
    };

    ws.onclose = (event) => {
      console.log(`${LOG_PREFIX} 🔌 onclose — code=${event.code} reason="${event.reason}" wasClean=${event.wasClean}`);
      connected = false;
      fire("disconnect");
      if (!manualClose) {
        console.log(`${LOG_PREFIX} ⏳ scheduling reconnect in 3s`);
        reconnectTimer = setTimeout(connect, 3000);
      } else {
        console.log(`${LOG_PREFIX} manual close — no reconnect`);
      }
    };

    ws.onerror = (err) => {
      console.error(`${LOG_PREFIX} ❌ onerror`, err);
    };
  };

  connect();

  socket = {
    get connected() { return connected; },
    on: (event, cb) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
      console.log(`${LOG_PREFIX} listener registered for "${event}" (total: ${listeners[event].length})`);
    },
    off: (event, cb) => {
      if (cb) {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(l => l !== cb);
          if (listeners[event].length === 0) delete listeners[event];
          console.log(`${LOG_PREFIX} listener removed for "${event}"`);
        }
      } else {
        console.log(`${LOG_PREFIX} all listeners removed for "${event}"`);
        delete listeners[event];
      }
    },
    emit: (event, data) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({ type: event, data });
        console.log(`${LOG_PREFIX} 🚀 emit — "${event}"`, data, `(msg len: ${payload.length})`);
        ws.send(payload);
      } else {
        console.warn(`${LOG_PREFIX} ⚠️ emit — "${event}" DROPPED (ws.readyState=${ws?.readyState})`, data);
      }
    },
    disconnect: () => {
      console.log(`${LOG_PREFIX} disconnect() — manual close`);
      manualClose = true;
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
      if (ws) {
        try { ws.close(); } catch (e) { console.error(`${LOG_PREFIX} close error:`, e); }
        ws = null;
      }
      connected = false;
      listeners = {};
    },
  };

  return socket;
};

function fire(event, data) {
  const cbs = listeners[event];
  if (cbs) {
    console.log(`${LOG_PREFIX} 🔔 fire — "${event}" to ${cbs.length} listener(s)`, data);
    cbs.forEach((cb) => cb(data));
  } else {
    console.log(`${LOG_PREFIX} 🔔 fire — "${event}" but NO listeners registered`, data);
  }
}

export const getSocket = () => {
  if (!socket) {
    console.log(`${LOG_PREFIX} getSocket() — socket null, calling connectSocket()`);
    connectSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  console.log(`${LOG_PREFIX} disconnectSocket()`);
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
