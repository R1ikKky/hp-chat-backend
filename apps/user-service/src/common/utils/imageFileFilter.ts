import { BadRequestException } from '@nestjs/common';
import 'multer';
import { IUploadedMulterFile } from '../../providers/files/s3/interfaces/upload-file.interface';

export const imageFileFilter = (
  req: any,
  file: IUploadedMulterFile,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (
    !file.originalname ||
    !file.originalname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)
  ) {
    return callback(
      new BadRequestException(`File must be of type jpg|jpeg|png|gif|svg|webp`),
      false,
    );
  }
  callback(null, true);
};
