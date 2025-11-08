// tests/api.test.js
const request = require('supertest');
const server = require('../app/index'); // Import server

// Đóng server sau khi test xong
afterAll((done) => {
    server.close(done);
});

describe('API Endpoints Tests', () => {

    // Test 1: GET /health
    it('GET /health :: should return 200 OK', async () => {
        const res = await request(server).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });

    // Test 2: GET /users
    it('GET /users :: should return all users', async () => {
        const res = await request(server).get('/users');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('name', 'Alice');
    });

    // Test 3: POST /user
    it('POST /user :: should add a new user', async () => {
        const res = await request(server)
            .post('/user')
            .send({ name: 'Charlie' });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('name', 'Charlie');
    });
});