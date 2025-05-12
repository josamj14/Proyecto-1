
jest.mock('../db/redisClient', () => ({
  client: {
    get: jest.fn(),
  },
  getPrefixedKey: jest.fn(),
}));

const cacheMiddleware = require('../middleware/cacheMiddleware');
const { client: redisClient, getPrefixedKey } = require('../db/redisClient');


beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('cacheMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {}, params: {}, body: {} }; 
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('should return cached data when cache hit occurs', async () => {
    const key = 'prefix:someKey';
    const fakeData = [{ id: 1, name: 'Test Item' }];

    getPrefixedKey.mockReturnValue(key);
    redisClient.get.mockResolvedValue(JSON.stringify(fakeData));

    const middleware = cacheMiddleware(() => 'someKey');
    await middleware(req, res, next);

    expect(getPrefixedKey).toHaveBeenCalledWith('someKey');
    expect(redisClient.get).toHaveBeenCalledWith(key);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'Data fetched from cache',
      data: fakeData,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() when cache miss occurs', async () => {
    getPrefixedKey.mockReturnValue('prefix:missingKey');
    redisClient.get.mockResolvedValue(null);

    const middleware = cacheMiddleware(() => 'missingKey');
    await middleware(req, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:missingKey');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should call next() and log error on Redis failure', async () => {
    getPrefixedKey.mockReturnValue('prefix:errorKey');
    redisClient.get.mockRejectedValue(new Error('Redis down'));

    const middleware = cacheMiddleware(() => 'errorKey');
    await middleware(req, res, next);

    expect(redisClient.get).toHaveBeenCalledWith('prefix:errorKey');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
