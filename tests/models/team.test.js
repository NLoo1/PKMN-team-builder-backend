const db = require('../../db/db');
const Team = require('../../app/models/team');
const { NotFoundError, BadRequestError } = require('../../app/middleware/expressError');

beforeAll(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS teams (
      team_id SERIAL PRIMARY KEY,
      team_name TEXT NOT NULL,
      user_id INTEGER REFERENCES users(user_id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

beforeEach(async function () {
  await db.query('BEGIN');
  await db.query('DELETE FROM teams');
  await db.query('DELETE FROM users');
});

afterEach(async function () {
  await db.query('ROLLBACK');
});

afterAll(async function () {
  try {
    await db.query('DROP TABLE IF EXISTS teams CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    if (typeof db.end === 'function') {
      await db.end();
    }
  } catch (err) {
    console.error('Error during teardown:', err);
  }
});

describe('Team model', function () {
  describe('createNew', function () {
    it('should create and return a new team', async function () {
      await db.query("INSERT INTO users (username) VALUES ('testuser') RETURNING user_id");
      const userIdRes = await db.query("SELECT user_id FROM users WHERE username = 'testuser'");
      const userId = userIdRes.rows[0].user_id;

      const newTeam = await Team.createNew({ team_name: 'Test Team', user_id: userId });
      expect(newTeam).toEqual({
        team_id: expect.any(Number),
        team_name: 'Test Team',
        user_id: userId
      });
    });

    it('should throw BadRequestError for missing required fields', async function () {
      await expect(Team.createNew({ team_name: 'Test Team' }))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe('get', function () {
    it('should return team data by team_id', async function () {
      await db.query("INSERT INTO users (username) VALUES ('testuser') RETURNING user_id");
      const userIdRes = await db.query("SELECT user_id FROM users WHERE username = 'testuser'");
      const userId = userIdRes.rows[0].user_id;

      const team = await Team.createNew({ team_name: 'Test Team', user_id: userId });
      const foundTeam = await Team.get(team.team_id);
      expect(foundTeam).toEqual({
        team_id: team.team_id,
        team_name: 'Test Team',
        user_id: userId,
        created_at: expect.any(Date)
      });
    });

    it('should throw NotFoundError if team is not found', async function () {
      await expect(Team.get(999))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('update', function () {
    it('should update and return the updated team data', async function () {
      await db.query("INSERT INTO users (username) VALUES ('testuser') RETURNING user_id");
      const userIdRes = await db.query("SELECT user_id FROM users WHERE username = 'testuser'");
      const userId = userIdRes.rows[0].user_id;

      const team = await Team.createNew({ team_name: 'Test Team', user_id: userId });
      const updatedTeam = await Team.update(team.team_id, { team_name: 'Updated Team' });
      expect(updatedTeam).toEqual({
        team_id: team.team_id,
        team_name: 'Updated Team',
        user_id: userId
      });
    });

    it('should throw NotFoundError if team is not found for update', async function () {
      await expect(Team.update(999, { team_name: 'Updated Team' }))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('remove', function () {
    it('should delete the team and return undefined', async function () {
      await db.query("INSERT INTO users (username) VALUES ('testuser') RETURNING user_id");
      const userIdRes = await db.query("SELECT user_id FROM users WHERE username = 'testuser'");
      const userId = userIdRes.rows[0].user_id;

      const team = await Team.createNew({ team_name: 'Test Team', user_id: userId });
      await Team.remove(team.team_id);
      await expect(Team.get(team.team_id))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw NotFoundError if team is not found for deletion', async function () {
      await expect(Team.remove(999))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('findAllTeamsByUsername', function () {
    it('should return all teams associated with a user', async function () {
      await db.query("INSERT INTO users (username) VALUES ('testuser') RETURNING user_id");
      const userIdRes = await db.query("SELECT user_id FROM users WHERE username = 'testuser'");
      const userId = userIdRes.rows[0].user_id;

      await Team.createNew({ team_name: 'Team 1', user_id: userId });
      await Team.createNew({ team_name: 'Team 2', user_id: userId });

      const teams = await Team.findAllTeamsByUsername('testuser');
      expect(teams.length).toBe(2);
      expect(teams).toEqual(expect.arrayContaining([
        expect.objectContaining({ team_name: 'Team 1' }),
        expect.objectContaining({ team_name: 'Team 2' })
      ]));
    });
  });

  describe('findTeamByUser', function () {
    beforeEach(async function () {
      await db.query("INSERT INTO users (username) VALUES ('testuser') RETURNING user_id");
      const userIdRes = await db.query("SELECT user_id FROM users WHERE username = 'testuser'");
      const userId = userIdRes.rows[0].user_id;
  
      await db.query("INSERT INTO teams (team_name, user_id) VALUES ('Test Team', $1)", [userId]);
    });
  
    it('should find a team by user and team name', async function () {
      const teams = await Team.findTeamByUser('testuser', 'Test Team');
      expect(teams.length).toBe(1);
      expect(teams[0].team_name).toBe('Test Team');
    });
  });
  
});
