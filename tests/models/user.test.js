const User = require('../../app/models/user');
const db = require('../../db/db');
const bcrypt = require('bcrypt');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../../app/middleware/expressError');
const { BCRYPT_WORK_FACTOR } = require('../../config/config.js');

describe('User model', () => {

  describe('register', () => {
    it('should register a new user', async () => {
      const newUser = await User.register({
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
        isAdmin: true
      });
      expect(newUser).toEqual({
        user_id: expect.any(Number),
        username: 'newuser',
        email: 'newuser@example.com',
        isAdmin: true
      });

      const dbUser = await db.query('SELECT * FROM users WHERE username = $1', ['newuser']);
      expect(dbUser.rows[0]).toBeDefined();
      expect(dbUser.rows[0].password).not.toBe('password123'); // Check hashed password
    });

    it('should throw an error if username is duplicate', async () => {
      await User.register({
        username: 'duplicateuser',
        password: 'password123',
        email: 'user1@example.com',
        isAdmin: false
      });

      await expect(User.register({
        username: 'duplicateuser',
        password: 'password123',
        email: 'user2@example.com',
        isAdmin: true
      })).rejects.toThrow(BadRequestError);
    });
  });

  describe('authenticate', () => {
    it('should authenticate a user with correct credentials', async () => {
      await User.register({
        username: 'new_user',
        password: 'password123',
        email: 'testuser@example.com',
        isAdmin: false
      });

      const user = await User.authenticate('new_user', 'password123');
      expect(user).toEqual({
        user_id: expect.any(Number),
        username: 'new_user',
        email: 'testuser@example.com',
        isAdmin: false
      });
    });

    it('should throw an error if credentials are invalid', async () => {
      await User.register({
        username: 'new_user',
        password: 'password123',
        email: 'testuser@example.com',
        isAdmin: false
      });

      await expect(User.authenticate('testuser', 'wrongpassword')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      await User.register({
        username: 'user1',
        password: 'password123',
        email: 'user1@example.com',
        isAdmin: false
      });

      await User.register({
        username: 'user2',
        password: 'password123',
        email: 'user2@example.com',
        isAdmin: true
      });

      const users = await User.findAll();
      expect(users).toHaveLength(4);
      expect(users).toEqual(expect.arrayContaining([
        expect.objectContaining({ username: 'user1', email: 'user1@example.com', isAdmin: false }),
        expect.objectContaining({ username: 'user2', email: 'user2@example.com', isAdmin: true })
      ]));
    });
  });

  describe('get', () => {
    it('should return user data by username', async () => {
      await User.register({
        username: 'test_user',
        password: 'password123',
        email: 'testuser@example.com',
        isAdmin: false
      });

      const user = await User.get('test_user');
      expect(user).toEqual({
        user_id: expect.any(Number),
        username: 'test_user',
        email: 'testuser@example.com',
        isAdmin: false,
        bio: null // Adjust if the schema includes bio
      });
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      await User.register({
        username: 'testuser',
        password: 'password123',
        email: 'testuser@example.com',
        isAdmin: false
      });

      const updatedUser = await User.update('testuser', { email: 'newemail@example.com', isAdmin: true });
      expect(updatedUser).toEqual({
        username: 'testuser',
        email: 'newemail@example.com',
        isAdmin: true
      });
    });

    it('should throw NotFoundError if user is not found', async () => {
      await expect(User.update('nonexistentuser', { email: 'newemail@example.com' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      await User.register({
        username: 'testuser',
        password: 'password123',
        email: 'testuser@example.com',
        isAdmin: false
      });

      await User.remove('testuser');

      const dbUser = await db.query('SELECT * FROM users WHERE username = $1', ['testuser']);
      expect(dbUser.rows.length).toBe(0);
    });

    it('should throw NotFoundError if user is not found', async () => {
      await expect(User.remove('nonexistentuser')).rejects.toThrow(NotFoundError);
    });
  });
});
