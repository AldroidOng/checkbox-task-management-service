import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ErrorResponse, GetTaskPayload, GetTaskResp } from 'src/shared/types/task-service.dto';
import { UserTaskService } from './user-task.service';

@Controller('send-notification')
export class UserTaskController {
  constructor(private readonly userTaskService: UserTaskService) {}

  @MessagePattern('test_user_task_service')
  test() {
    return 'User Task Service is up!';
  }

  @MessagePattern({ cmd: 'get_task' })
  async getTask(@Payload() data: GetTaskPayload): Promise<GetTaskResp[]| ErrorResponse> {
    try {
      const userTasks = await this.userTaskService.getTasks(data);

      return userTasks;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: Error): ErrorResponse {
    // Customize error response based on the error
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message
    };
  }

}
