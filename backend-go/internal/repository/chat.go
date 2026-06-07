package repository

import (
	"github.com/hariomop12/real-time-chat-app/backend-go/internal/model"
	"gorm.io/gorm"
)

type ChatRepo struct {
	db *gorm.DB
}

func NewChatRepo(db *gorm.DB) *ChatRepo {
	return &ChatRepo{db: db}
}

func (r *ChatRepo) GetByUser(userID string) ([]model.Chat, error) {
	var chats []model.Chat
	err := r.db.Raw(`
		SELECT c.*, cm2.last_message, cm2.last_message_at,
		       other.other_user_id, other.other_username, other.other_avatar
		FROM chats c
		JOIN chat_members cm ON cm.chat_id = c.id
		LEFT JOIN LATERAL (
			SELECT content AS last_message, created_at AS last_message_at
			FROM messages
			WHERE chat_id = c.id
			ORDER BY created_at DESC
			LIMIT 1
		) cm2 ON true
		LEFT JOIN LATERAL (
			SELECT u.id AS other_user_id, u.username AS other_username, u.avatar AS other_avatar
			FROM chat_members cmo
			JOIN users u ON u.id = cmo.user_id
			WHERE cmo.chat_id = c.id AND cmo.user_id != ?
			LIMIT 1
		) other ON true
		WHERE cm.user_id = ?
		ORDER BY cm2.last_message_at DESC NULLS LAST
	`, userID, userID).Scan(&chats).Error
	return chats, err
}

func (r *ChatRepo) FindDirectChat(userID1, userID2 string) (*string, error) {
	var id string
	err := r.db.Raw(`
		SELECT c.id FROM chats c
		WHERE c.is_group = false
		AND EXISTS (SELECT 1 FROM chat_members WHERE chat_id = c.id AND user_id = ?)
		AND EXISTS (SELECT 1 FROM chat_members WHERE chat_id = c.id AND user_id = ?)
	`, userID1, userID2).Scan(&id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &id, err
}

func (r *ChatRepo) Create(name string, isGroup bool) (string, error) {
	chat := model.Chat{Name: &name, IsGroup: isGroup}
	if name == "" {
		chat.Name = nil
	}
	err := r.db.Create(&chat).Error
	return chat.ID, err
}

func (r *ChatRepo) AddMembers(chatID string, userIDs []string) error {
	for _, uid := range userIDs {
		member := model.ChatMember{ChatID: chatID, UserID: uid}
		if err := r.db.FirstOrCreate(&member, "chat_id = ? AND user_id = ?", chatID, uid).Error; err != nil {
			return err
		}
	}
	return nil
}

func (r *ChatRepo) GetByID(chatID, userID string) (*model.Chat, error) {
	var chat model.Chat
	err := r.db.Raw(`
		SELECT c.*, u.id AS other_user_id, u.username AS other_username, u.avatar AS other_avatar
		FROM chats c
		JOIN chat_members cm ON cm.chat_id = c.id
		JOIN users u ON u.id = cm.user_id
		WHERE c.id = ? AND u.id != ?
	`, chatID, userID).Scan(&chat).Error
	return &chat, err
}

func (r *ChatRepo) DeleteDirect(chatID, userID string) (bool, error) {
	result := r.db.Exec(`
		DELETE FROM chats c
		WHERE c.id = ?
		  AND c.is_group = false
		  AND EXISTS (
			SELECT 1 FROM chat_members cm
			WHERE cm.chat_id = c.id AND cm.user_id = ?
		  )
	`, chatID, userID)
	if result.Error != nil {
		return false, result.Error
	}
	return result.RowsAffected > 0, nil
}
