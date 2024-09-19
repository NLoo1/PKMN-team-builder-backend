const User = require('../../app/models/user');
const db = require('../../db/db');
const bcrypt = require('bcrypt');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../../app/middleware/expressError');
const { BCRYPT_WORK_FACTOR } = require('../../config/config.js');

// Create test database schema and seed data
beforeAll(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      is_admin BOOLEAN DEFAULT FALSE,
      bio TEXT
    )
  `);
});

// Start a transaction before each test
beforeEach(async () => {
  await db.query('BEGIN');
});

// Rollback the transaction after each test
afterEach(async () => {
  await db.query('ROLLBACK');
});

// Drop the table and close the database connection after all tests
afterAll(async () => {
  try {
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    
    // Check if `db.end` exists and call it to close the database connection
    if (typeof db.end === 'function') {
      await db.end();
    }
  } catch (err) {
    console.error('Error during teardown:', err);
  }
});

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
        username: 'testuser',
        password: 'password123',
        email: 'testuser@example.com',
        isAdmin: false
      });

      const user = await User.authenticate('testuser', 'password123');
      expect(user).toEqual({
        user_id: expect.any(Number),
        username: 'testuser',
        email: 'testuser@example.com',
        isAdmin: false
      });
    });

    it('should throw an error if credentials are invalid', async () => {
      await User.register({
        username: 'testuser',
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
      expect(users).toHaveLength(2);
      expect(users).toEqual(expect.arrayContaining([
        expect.objectContaining({ username: 'user1', email: 'user1@example.com', isAdmin: false }),
        expect.objectContaining({ username: 'user2', email: 'user2@example.com', isAdmin: true })
      ]));
    });
  });

  describe('get', () => {
    it('should return user data by username', async () => {
      await User.register({
        username: 'testuser',
        password: 'password123',
        email: 'testuser@example.com',
        isAdmin: false
      });

      const user = await User.get('testuser');
      expect(user).toEqual({
        user_id: expect.any(Number),
        username: 'testuser',
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
