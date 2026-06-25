CREATE TABLE users (
    id UUID PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP,
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP
);
