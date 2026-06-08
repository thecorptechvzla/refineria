import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ProcessesModule } from '../processes/processes.module';

@Module({
  imports: [ProcessesModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
