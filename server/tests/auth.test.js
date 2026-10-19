import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Wallet } from '../src/models/Wallet.js';

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  });

  beforeEach(async () => {
    // Clear test collections between tests for deterministic isolation
    await User.deleteMany({});
    await Wallet.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await disconnectDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and initialize a wallet with 0 paise', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.name).toBe('Jane Doe');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // ensure password hash not leaked

      // Verify wallet initialization with 0 paise
      expect(res.body.data.wallet).toBeDefined();
      expect(res.body.data.wallet.balance).toBe(0);

      const dbWallet = await Wallet.findOne({ user: res.body.data.user.id });
      expect(dbWallet).not.toBeNull();
      expect(dbWallet.balance).toBe(0);
    });

    it('should reject registration when email is already registered (duplicate email)', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Original User',
          email: 'duplicate@example.com',
          password: 'Password123',
        });

      // Second registration with duplicate email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Copycat User',
          email: 'duplicate@example.com',
          password: 'AnotherPassword456',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should fail validation when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'shortpass@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create user for login testing
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Smith',
          email: 'john@example.com',
          password: 'SecretPassword99',
        });
    });

    it('should successfully log in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'SecretPassword99',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.wallet.balance).toBe(0);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ghost@example.com',
          password: 'SecretPassword99',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let validToken;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Wonder',
          email: 'alice@example.com',
          password: 'AlicePassword123',
        });

      validToken = registerRes.body.data.token;
    });

    it('should return current user profile and wallet when valid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.name).toBe('Alice Wonder');
      expect(res.body.data.wallet.balance).toBe(0);
    });

    it('should reject request when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/missing or malformed/i);
    });

    it('should reject request when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid authentication token/i);
    });
  });
});
