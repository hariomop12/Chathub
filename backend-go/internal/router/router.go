package router

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/config"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/handler"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/middleware"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/repository"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/ws"
)

func New(cfg *config.Config, userRepo *repository.UserRepo, chatRepo *repository.ChatRepo, messageRepo *repository.MessageRepo) http.Handler {
	r := chi.NewRouter()

	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.RealIP)

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{cfg.ClientURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	r.Use(corsHandler.Handler)

	r.Use(middleware.ClerkAuth(cfg.ClerkSecretKey))

	userH := handler.NewUserHandler(userRepo)
	chatH := handler.NewChatHandler(chatRepo, messageRepo)
	msgH := handler.NewMessageHandler(messageRepo)

	webhookH := handler.NewWebhookHandler(userRepo, cfg.ClerkWebhookSec)

	uploadH, err := handler.NewUploadHandler(cfg)
	if err != nil {
		log.Printf("Upload handler disabled: %v", err)
		var nilUpload *handler.UploadHandler
		uploadH = nilUpload
	}

	wsHub := ws.NewHub(messageRepo)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Chat API running..."))
	})

	r.Route("/api", func(r chi.Router) {
		r.Route("/webhooks", func(r chi.Router) {
			r.Post("/clerk", webhookH.HandleClerk)
		})

		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth)

			r.Route("/users", func(r chi.Router) {
				r.Get("/", userH.GetUsers)
				r.Get("/search", userH.SearchUsers)
				r.Post("/", userH.UpsertUser)
			})

			r.Route("/chats", func(r chi.Router) {
				r.Get("/", chatH.GetChats)
				r.Post("/", chatH.CreateChat)
				r.Get("/{chatId}", chatH.GetChatByID)
				r.Delete("/{chatId}", chatH.DeleteDirectChat)
			})

			r.Route("/messages", func(r chi.Router) {
				r.Get("/{chatId}", msgH.GetMessages)
				r.Post("/{chatId}", msgH.SendMessage)
			})

			r.Route("/upload", func(r chi.Router) {
				if uploadH != nil {
					r.Post("/", uploadH.UploadFile)
				}
			})
		})
	})

	r.Get("/ws", wsHub.HandleWS)

	return r
}
