#!/bin/bash

# Chat App Backend API Testing Script
# Set your token first: TOKEN="your_token_here"

BASE_URL="http://localhost:3000/api"
TOKEN="${TOKEN:-YOUR_CLERK_TOKEN}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_section() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# ===== USERS =====

get_users() {
  echo_section "GET ALL USERS"
  curl -s -X GET "$BASE_URL/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq .
}

search_users() {
  local query=$1
  echo_section "SEARCH USERS: $query"
  curl -s -X GET "$BASE_URL/users/search?q=$query" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq .
}

upsert_user() {
  local username=$1
  local email=$2
  local avatar=$3
  echo_section "UPSERT USER: $username"
  curl -s -X POST "$BASE_URL/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$username\",
      \"email\": \"$email\",
      \"avatar\": \"$avatar\"
    }" | jq .
}

# ===== CHATS =====

get_chats() {
  echo_section "GET ALL CHATS"
  curl -s -X GET "$BASE_URL/chats" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq .
}

create_direct_chat() {
  local user_id=$1
  echo_section "CREATE DIRECT CHAT WITH: $user_id"
  curl -s -X POST "$BASE_URL/chats" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"participantIds\": [\"$user_id\"]
    }" | jq .
}

create_group_chat() {
  local name=$1
  shift
  local ids=("$@")
  echo_section "CREATE GROUP CHAT: $name"
  
  # Build JSON array of participant IDs
  local json_ids=$(printf '"%s",' "${ids[@]}" | sed 's/,$//')
  
  curl -s -X POST "$BASE_URL/chats" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"participantIds\": [$json_ids],
      \"name\": \"$name\"
    }" | jq .
}

get_chat() {
  local chat_id=$1
  echo_section "GET CHAT: $chat_id"
  curl -s -X GET "$BASE_URL/chats/$chat_id" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq .
}

delete_chat() {
  local chat_id=$1
  echo_section "DELETE CHAT: $chat_id"
  curl -s -X DELETE "$BASE_URL/chats/$chat_id" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq .
}

# ===== MESSAGES =====

get_messages() {
  local chat_id=$1
  echo_section "GET MESSAGES FROM CHAT: $chat_id"
  curl -s -X GET "$BASE_URL/messages/$chat_id" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq .
}

send_message() {
  local chat_id=$1
  local content=$2
  echo_section "SEND MESSAGE TO CHAT: $chat_id"
  curl -s -X POST "$BASE_URL/messages/$chat_id" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"content\": \"$content\"
    }" | jq .
}

# ===== UPLOAD =====

upload_file() {
  local file_path=$1
  echo_section "UPLOAD FILE: $file_path"
  
  if [ ! -f "$file_path" ]; then
    echo "❌ File not found: $file_path"
    return 1
  fi
  
  curl -s -X POST "$BASE_URL/upload" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$file_path" | jq .
}

# ===== HELP =====

show_help() {
  echo -e "${GREEN}Chat App Backend API Testing${NC}"
  echo ""
  echo "Usage: source test_api.sh"
  echo ""
  echo "Functions available:"
  echo ""
  echo "  Users:"
  echo "    get_users"
  echo "    search_users 'john'"
  echo "    upsert_user 'john' 'john@example.com' 'https://example.com/avatar.jpg'"
  echo ""
  echo "  Chats:"
  echo "    get_chats"
  echo "    create_direct_chat 'user_id_123'"
  echo "    create_group_chat 'Group Name' 'user_id_1' 'user_id_2'"
  echo "    get_chat 'chat_id_456'"
  echo "    delete_chat 'chat_id_456'"
  echo ""
  echo "  Messages:"
  echo "    get_messages 'chat_id_456'"
  echo "    send_message 'chat_id_456' 'Hello there!'"
  echo ""
  echo "  Files:"
  echo "    upload_file './file.pdf'"
  echo ""
  echo "Setup:"
  echo "  export TOKEN='your_clerk_token_here'"
  echo ""
}

# Display help on sourcing
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
  # Script is being run directly
  show_help
else
  # Script is being sourced
  echo -e "${GREEN}✓ Chat API functions loaded${NC}"
  echo "Run 'show_help' to see available functions"
  echo "First, set your token: export TOKEN='your_token_here'"
fi
