import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientOptions, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Task } from 'src/shared/models/task.model';
import { User } from 'src/shared/models/user.model';
import { UserTaskService } from './user-task.service';
import { UserTaskController } from './user-task.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER',
        useFactory: (configService: ConfigService): ClientOptions => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('USER_MICROSERVICE_HOST') ||
              'localhost',
            port:
              parseInt(
                configService.get<string>('USER_MICROSERVICE_PORT'),
                10,
              ) || 3002,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    SequelizeModule.forFeature([User, Task]),
  ],
  providers: [UserTaskService],
  controllers: [UserTaskController],
})
export class UserTaskModule {}
