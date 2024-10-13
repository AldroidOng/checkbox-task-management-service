import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateTaskPayload,
  CreateTaskResp,
  ErrorResponse,
  GetTaskPayload,
  GetTaskResp,
} from 'src/shared/types/task-service.dto';
import { UserTaskService } from './user-task.service';

@Controller('send-notification')
export class UserTaskController {
  constructor(private readonly userTaskService: UserTaskService) {}

  @MessagePattern({ cmd: 'get_task' })
  async getTask(@Payload() data: GetTaskPayload): Promise<GetTaskResp> {
    try {
      const userTasks = await this.userTaskService.getTasks(data);

      return userTasks;
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern({ cmd: 'create_task' })
  async createTask(
    @Payload() data: CreateTaskPayload,
  ): Promise<CreateTaskResp> {
    try {
      const taskId = await this.userTaskService.createTask(data);

      return taskId;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: Error): ErrorResponse {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message,
    };
  }
}
