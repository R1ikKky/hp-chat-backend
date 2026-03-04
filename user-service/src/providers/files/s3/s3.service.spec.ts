import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as AWS from '@aws-sdk/client-s3';
import { S3Service } from './s3.service';

describe('S3Service', () => {
  let service: S3Service;
  let s3Client: AWS.S3;

  beforeEach(() => {
    s3Client = {
      putObject: jest.fn(),
      deleteObject: jest.fn(),
    } as unknown as AWS.S3;

    service = new S3Service(s3Client);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
