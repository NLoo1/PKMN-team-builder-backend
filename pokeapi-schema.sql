CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(25),
  password TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bio TEXT DEFAULT NULL
);


-- Each team is under one user
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE teams_pokemon (
    id SERIAL PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    pokemon_name VARCHAR(50) NOT NULL, -- Assuming Pokémon names are typically short
    pokemon_id INT NOT NULL,
    position INT NOT NULL CHECK (position >= 1 AND position <= 6), -- Position in the team (1-6)
    nickname VARCHAR(50), -- Optional: If users want to give their Pokémon nicknames
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    UNIQUE (team_id, position), -- Ensure that each position in a team is unique
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Separate statements to create indexes
CREATE INDEX idx_team_id ON teams_pokemon (team_id);
CREATE INDEX idx_user_id ON teams_pokemon (user_id);
