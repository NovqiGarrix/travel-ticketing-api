import { RateLimitInterceptor } from './rate-limit.interceptor';

describe('RateLimitInterceptor', () => {
  it('should be defined', () => {
    expect(new RateLimitInterceptor()).toBeDefined();
  });
});
