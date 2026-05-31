-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  picture TEXT,
  balance REAL NOT NULL DEFAULT 150.0,
  provider TEXT NOT NULL DEFAULT 'local',
  provider_id TEXT,
  steam_trade_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

-- Skins catalog
CREATE TABLE IF NOT EXISTS skins (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  wear TEXT,
  price REAL NOT NULL,
  rarity TEXT,
  collection TEXT,
  image TEXT
);

CREATE INDEX IF NOT EXISTS idx_skins_type ON skins(type);
CREATE INDEX IF NOT EXISTS idx_skins_rarity ON skins(rarity);

-- User inventory (each row = one owned instance)
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  skin_id INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'purchase',
  acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skin_id) REFERENCES skins(id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  skin_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, skin_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skin_id) REFERENCES skins(id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- Transaction history
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  item_name TEXT,
  amount REAL NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_user ON history(user_id, created_at DESC);
