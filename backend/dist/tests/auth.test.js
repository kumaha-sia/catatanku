"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const db_1 = __importDefault(require("../src/db"));
describe('Auth API', () => {
    const testUser = {
        name: 'Test User',
        email: 'testauth@example.com',
        password: 'password123'
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up if user already exists
        yield db_1.default.user.deleteMany({ where: { email: testUser.email } });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up after tests
        yield db_1.default.user.deleteMany({ where: { email: testUser.email } });
        yield db_1.default.$disconnect();
    }));
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/register')
                .send(testUser);
            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data.user.email).toBe(testUser.email);
            expect(response.body.data).toHaveProperty('token');
        }));
        it('should return error if email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/register')
                .send(testUser);
            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
        }));
    });
    describe('POST /api/v1/auth/login', () => {
        it('should login user successfully and return token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password
            });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('token');
        }));
        it('should return 401 for wrong password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/login')
                .send({
                email: testUser.email,
                password: 'wrongpassword'
            });
            expect(response.status).toBe(401);
            expect(response.body.status).toBe('error');
        }));
    });
});
