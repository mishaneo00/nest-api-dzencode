import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import * as Express from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  @Get('uploads/:filename')
  async download(
    @Param('filename') filename: string,
    @Query('mime') mime: string,
    @Res() res: Express.Response,
  ) {
    const { filePath } = await this.filesService.downloadFile(filename, mime);

    return res.download(filePath);
  }
}
