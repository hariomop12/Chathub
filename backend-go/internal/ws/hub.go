package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/model"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/repository"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Client struct {
	conn   *websocket.Conn
	userID string
	hub    *Hub
	send   chan []byte
}

type Hub struct {
	mu         sync.RWMutex
	clients    map[*Client]bool
	userSocket map[string]*Client
	peerMap    map[string]string
	messageRepo *repository.MessageRepo
}

func NewHub(messageRepo *repository.MessageRepo) *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		userSocket:  make(map[string]*Client),
		peerMap:     make(map[string]string),
		messageRepo: messageRepo,
	}
}

func (h *Hub) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws upgrade: %v", err)
		return
	}

	client := &Client{
		conn: conn,
		hub:  h,
		send: make(chan []byte, 256),
	}

	h.mu.Lock()
	h.clients[client] = true
	h.mu.Unlock()

	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.hub.mu.Lock()
		if c.userID != "" {
			delete(c.hub.userSocket, c.userID)
			delete(c.hub.peerMap, c.userID)
		}
		delete(c.hub.clients, c)
		c.hub.mu.Unlock()
		c.conn.Close()
	}()

	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var event struct {
			Type     string          `json:"type"`
			Data     json.RawMessage `json:"data"`
		}
		if err := json.Unmarshal(msg, &event); err != nil {
			continue
		}

		c.handleEvent(event)
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}

type socketEvent struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func (c *Client) handleEvent(event struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}) {
	h := c.hub

	switch event.Type {
	case "register-user":
		var data struct {
			UserID string `json:"userId"`
		}
		json.Unmarshal(event.Data, &data)
		if data.UserID != "" {
			c.userID = data.UserID
			h.mu.Lock()
			h.userSocket[data.UserID] = c
			h.mu.Unlock()
		}

	case "register-peer":
		var data struct {
			UserID string `json:"userId"`
			PeerID string `json:"peerId"`
		}
		json.Unmarshal(event.Data, &data)
		if data.UserID != "" && data.PeerID != "" {
			h.mu.Lock()
			h.peerMap[data.UserID] = data.PeerID
			h.mu.Unlock()
		}

	case "get-peer-id":
		var data struct {
			TargetUserID string `json:"targetUserId"`
		}
		json.Unmarshal(event.Data, &data)
		h.mu.RLock()
		peerID := h.peerMap[data.TargetUserID]
		h.mu.RUnlock()

		resp, _ := json.Marshal(socketEvent{
			Type: "peer-id-response",
			Data: map[string]interface{}{"peerId": peerID},
		})
		c.send <- resp

	case "join-room":
		var data struct {
			ChatID string `json:"chatId"`
		}
		json.Unmarshal(event.Data, &data)

	case "leave-room":
		var data struct {
			ChatID string `json:"chatId"`
		}
		json.Unmarshal(event.Data, &data)

	case "typing":
		var data struct {
			ChatID   string `json:"chatId"`
			UserID   string `json:"userId"`
			Username string `json:"username"`
		}
		json.Unmarshal(event.Data, &data)
		h.broadcastToRoom(data.ChatID, c, socketEvent{
			Type: "user-typing",
			Data: data,
		})

	case "stop-typing":
		var data struct {
			ChatID string `json:"chatId"`
			UserID string `json:"userId"`
		}
		json.Unmarshal(event.Data, &data)
		h.broadcastToRoom(data.ChatID, c, socketEvent{
			Type: "user-stop-typing",
			Data: data,
		})

	case "send-message":
		var data model.MessagePayload
		json.Unmarshal(event.Data, &data)

		msg, err := h.messageRepo.Create(&data)
		if err != nil {
			log.Printf("ws send-message error: %v", err)
			return
		}

		h.broadcastToRoom(data.ChatID, nil, socketEvent{
			Type: "receive-message",
			Data: msg,
		})

	case "call-user":
		var data struct {
			TargetUserID string `json:"targetUserId"`
			CallerID     string `json:"callerId"`
			CallerUsername string `json:"callerUsername"`
			CallerAvatar string `json:"callerAvatar"`
			IsVideo      bool   `json:"isVideo"`
		}
		json.Unmarshal(event.Data, &data)

		h.mu.RLock()
		target, ok := h.userSocket[data.TargetUserID]
		h.mu.RUnlock()

		if ok {
			resp, _ := json.Marshal(socketEvent{
				Type: "incoming-call",
				Data: data,
			})
			target.send <- resp
		} else {
			resp, _ := json.Marshal(socketEvent{
				Type: "user-busy",
				Data: map[string]string{"targetUserId": data.TargetUserID},
			})
			c.send <- resp
		}

	case "call-answered":
		var data struct {
			TargetUserID string `json:"targetUserId"`
		}
		json.Unmarshal(event.Data, &data)
		h.sendToUser(data.TargetUserID, socketEvent{Type: "call-answered", Data: data})

	case "call-rejected":
		var data struct {
			TargetUserID string `json:"targetUserId"`
		}
		json.Unmarshal(event.Data, &data)
		h.sendToUser(data.TargetUserID, socketEvent{Type: "call-rejected", Data: data})

	case "end-call":
		var data struct {
			TargetUserID string `json:"targetUserId"`
		}
		json.Unmarshal(event.Data, &data)
		h.sendToUser(data.TargetUserID, socketEvent{Type: "call-ended", Data: data})
	}
}

func (h *Hub) broadcastToRoom(chatID string, exclude *Client, evt socketEvent) {
	msg, _ := json.Marshal(evt)

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client == exclude {
			continue
		}
		select {
		case client.send <- msg:
		default:
			delete(h.clients, client)
			close(client.send)
		}
	}
}

func (h *Hub) sendToUser(userID string, evt socketEvent) {
	msg, _ := json.Marshal(evt)

	h.mu.RLock()
	client, ok := h.userSocket[userID]
	h.mu.RUnlock()

	if ok {
		select {
		case client.send <- msg:
		default:
		}
	}
}
