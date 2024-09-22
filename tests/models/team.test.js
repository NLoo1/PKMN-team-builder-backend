const db = require('../../db/db');
const Team = require('../../app/models/team');
const { NotFoundError, BadRequestError } = require('../../app/middleware/expressError');

describe('Team model', function () {

  describe('createNew', function () {
    it('should create and return a new team', async function () {
      const newTeam = await Team.createNew({ team_name: 'Test Team', user_id: global.user_id });
      expect(newTeam).toEqual({
        team_id: expect.any(Number),
        team_name: 'Test Team',
        user_id: global.user_id
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
      const team = await Team.createNew({ team_name: 'Test Team', user_id: global.user_id });
      const foundTeam = await Team.get(team.team_id);
      expect(foundTeam).toEqual({
        team_id: team.team_id,
        team_name: 'Test Team',
        user_id: global.user_id,
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
      const team = await Team.createNew({ team_name: 'Test Team', user_id: global.user_id });
      const updatedTeam = await Team.update(team.team_id, { team_name: 'Updated Team' });
      expect(updatedTeam).toEqual({
        team_id: team.team_id,
        team_name: 'Updated Team',
        user_id: global.user_id
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
      const team = await Team.createNew({ team_name: 'Test Team', user_id: global.user_id });
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
    beforeEach(async () => {
      await Team.createNew({ team_name: 'Team 1', user_id: global.user_id });
      await Team.createNew({ team_name: 'Team 2', user_id: global.user_id });
    });

    it('should return all teams associated with a user', async function () {
      const teams = await Team.findAllTeamsByUsername(global.username);

      // Accounting for jest setup
      expect(teams.length).toBe(3);
      expect(teams).toEqual(expect.arrayContaining([
        expect.objectContaining({ team_name: 'Team 1' }),
        expect.objectContaining({ team_name: 'Team 2' })
      ]));
    });
  });

  describe('findTeamByUser', function () {

    // Test Team 2, since jest setup already has a Test Team
    beforeEach(async function () {
      await Team.createNew({ team_name: 'Test Team 2', user_id });
    });

    it('should find a team by user and team name', async function () {
      const teams = await Team.findTeamByUser(global.username, 'Test Team 2');
      expect(teams.length).toBe(1);
      expect(teams[0].team_name).toBe('Test Team 2');
    });
  });
});
