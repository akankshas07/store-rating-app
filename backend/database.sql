CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('ADMIN', 'USER', 'OWNER'))
);

CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT rating_value_check
        CHECK (rating >= 1 AND rating <= 5),

    CONSTRAINT unique_user_store_rating
        UNIQUE (user_id, store_id)
);