package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/middleware"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/model"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/repository"
)

type MessageHandler struct {
	repo *repository.MessageRepo
}

func NewMessageHandler(repo *repository.MessageRepo) *MessageHandler {
	return &MessageHandler{repo: repo}
}

func (h *MessageHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	chatID := chi.URLParam(r, "chatId")
	messages, err := h.repo.GetByChat(chatID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Failed to fetch messages")
		return
	}
	writeJSON(w, http.StatusOK, messages)
}

func (h *MessageHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	chatID := chi.URLParam(r, "chatId")

	var body struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	msg, err := h.repo.Create(&model.MessagePayload{
		ChatID:   chatID,
		SenderID: userID,
		Content:  body.Content,
	})
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Failed to send message")
		return
	}
	writeJSON(w, http.StatusCreated, msg)
}
