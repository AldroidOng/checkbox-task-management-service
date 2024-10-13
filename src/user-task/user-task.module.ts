import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Task } from 'src/shared/models/task.model';
import { User } from 'src/shared/models/user.model';
import { UserTaskService } from './user-task.service';
import { UserTaskController } from './user-task.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Task]),
  ],
  providers: [UserTaskService],
  controllers: [UserTaskController],
})
export class UserTaskModule {}
