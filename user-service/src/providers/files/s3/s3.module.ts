import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    S3Service,
    {
      provide: S3Lib,
      useFactory: (cfg: ConfigService) => {
        return new AWS.S3({
          endpoint: String(cfg.get('MINIO_ENDPOINT')),
          region: String(cfg.get('MINIO_REGION')),
          credentials: {
            accessKeyId: String(cfg.get('MINIO_ACCESS_KEY_ID')),
            secretAccessKey: String(cfg.get('MINIO_SECRET_KEY_ID')),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}
