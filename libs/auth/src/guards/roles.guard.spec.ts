import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'get'>>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    };

    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('should allow routes without role metadata', () => {
    reflector.get
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(undefined as unknown as string[]);

    const context = {
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});
