import { db } from "../db/db.js";

const buildDisplayName = (user) => {
  return (
    user.username ||
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "Anonymous"
  );
};

const getPrimaryEmail = (user) => {
  const primaryEmail = user.email_addresses?.find(
    (email) => email.id === user.primary_email_address_id
  );

  return primaryEmail?.email_address || user.email_addresses?.[0]?.email_address || "";
};

export const upsertUserRecord = async ({ id, username, email, avatar }) => {
  const result = await db.query(
    `INSERT INTO users (id, username, email, avatar)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET username = $2, email = $3, avatar = $4
     RETURNING *`,
    [id, username || "Anonymous", email || "", avatar || null]
  );

  return result.rows[0];
};

export const upsertClerkUser = async (user) => {
  return upsertUserRecord({
    id: user.id,
    username: buildDisplayName(user),
    email: getPrimaryEmail(user),
    avatar: user.image_url,
  });
};

export const getUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, email, avatar FROM users ORDER BY username"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const result = await db.query(
      "SELECT id, username, email, avatar FROM users WHERE username ILIKE $1 OR email ILIKE $1 LIMIT 20",
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("searchUsers error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

export const upsertUser = async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    const user = await upsertUserRecord({
      id: req.userId,
      username,
      email,
      avatar,
    });

    res.json(user);
  } catch (err) {
    console.error("upsertUser error:", err);
    res.status(500).json({ error: "Failed to save user" });
  }
};
