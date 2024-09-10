-- both test users have the password 'password'

INSERT INTO users (username, password, email, is_admin, bio)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'joel@joelburton.com',
        FALSE, 'I am a test user!'),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'joel@joelburton.com',
        TRUE, 'I am a test admin!');


-- Test team under testuser (ID 1)
INSERT INTO teams(team_name, user_id)
VALUES ('test-team', 1);

-- This is a team of bulbasaurs in all 6 positions under testuser (ID 1)
INSERT INTO teams_pokemon (team_id, user_id, pokemon_name, pokemon_id, position)
VALUES 
(1, 1, 'bulbasaur', 1, 1),
(1, 1, 'ivysaur', 2, 2),
(1, 1, 'venusaur', 3, 3),
(1, 1, 'charmander', 4, 4),
(1, 1, 'charmeleon', 5, 5),
(1, 1, 'charizard', 6, 6);
