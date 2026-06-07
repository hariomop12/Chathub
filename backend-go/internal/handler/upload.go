package handler

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsCfg "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/config"
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/model"
)

type UploadHandler struct {
	client    *s3.Client
	bucket    string
	publicURL string
}

func NewUploadHandler(cfg *config.Config) (*UploadHandler, error) {
	awsConfig, err := awsCfg.LoadDefaultConfig(context.Background(),
		awsCfg.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	client := s3.NewFromConfig(awsConfig, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(cfg.R2Endpoint)
		o.UsePathStyle = true
	})

	if cfg.R2AccessKey != "" {
		// credentials are loaded via env vars by default
	}

	return &UploadHandler{
		client:    client,
		bucket:    cfg.R2Bucket,
		publicURL: cfg.R2PublicURL,
	}, nil
}

func (h *UploadHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 50<<20)

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeErr(w, http.StatusBadRequest, "File too large or invalid form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeErr(w, http.StatusBadRequest, "No file provided")
		return
	}
	defer file.Close()

	if header.Size > 50<<20 {
		writeErr(w, http.StatusBadRequest, "File exceeds 50MB limit")
		return
	}

	ext := ""
	for i := len(header.Filename) - 1; i >= 0; i-- {
		if header.Filename[i] == '.' {
			ext = header.Filename[i:]
			break
		}
	}

	key := uuid.New().String() + ext

	body, err := io.ReadAll(file)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Failed to read file")
		return
	}

	_, err = h.client.PutObject(r.Context(), &s3.PutObjectInput{
		Bucket:      aws.String(h.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(body),
		ContentType: aws.String(header.Header.Get("Content-Type")),
	})
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Failed to upload file")
		return
	}

	writeJSON(w, http.StatusOK, model.UploadResponse{
		URL:  h.publicURL + "/" + key,
		Name: header.Filename,
		Type: header.Header.Get("Content-Type"),
		Size: header.Size,
	})
}


