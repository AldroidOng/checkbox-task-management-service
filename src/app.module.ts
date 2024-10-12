import { Module } from '@nestjs/common';
import { UserTaskModule } from './user-task/user-task.module';
import { ConfigModule, DatabaseModule } from './shared';

@Module({
  imports: [UserTaskModule, DatabaseModule, ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
