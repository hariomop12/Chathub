package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/hariomop12/real-time-chat-app/backend-go/internal/config"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/db"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/repository"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/router"
	"github.com/joho/godotenv"
)

func main() {
	// Try loading .env from project root
	godotenv.Load(filepath.Join("..", "..", ".env")) // from cmd/server/
	godotenv.Load()                                   // from cwd
	godotenv.Load(filepath.Join("..", ".env"))        // from backend-go/
	cfg := config.Load()

	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("DB connect: %v", err)
	}
	log.Println("Postgres connected")

	userRepo := repository.NewUserRepo(database)
	chatRepo := repository.NewChatRepo(database)
	messageRepo := repository.NewMessageRepo(database)

	handler := router.New(cfg, database, userRepo, chatRepo, messageRepo)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("Server running on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Listen: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Forced shutdown: %v", err)
	}
	log.Println("Server stopped")
}
