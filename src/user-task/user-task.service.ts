import * as moment from "moment";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from 'src/shared/models/task.model';
import { User } from 'src/shared/models/user.model';
import { CreateTaskPayload, CreateTaskResp, CreateTaskRespSuccess, GetTaskPayload, GetTaskResp, GetTaskRespSuccess } from 'src/shared/types/task-service.dto';

@Injectable()
export class UserTaskService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Task) private taskModel: typeof Task,
  ) {}

  async getTasks(getTaskPayload: GetTaskPayload): Promise<GetTaskRespSuccess[]> {
    const user = await this.getUser(getTaskPayload.email);

    if (!user) {
      throw new Error('User Not Found');
    }

    const tasks = await this.taskModel.findAll({
      where: { userId: user.id },
    });

    const userTasks = [];

    if (tasks.length === 0) {
      return userTasks;
    }

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i].dataValues;

      userTasks.push({
        taskName: task.name,
        taskDescription: task.description,
        dueDate: moment(task.dueDate).format(),
        createdAt: moment(task.createdAt).format(),
      });
    }

    return userTasks;
  }

  async createTask(taskData: CreateTaskPayload): Promise<CreateTaskRespSuccess> {
    const user = await this.getUser(taskData.email);

    if (!user) {
      throw new Error('User Not Found');
    }

    const tasks = await this.taskModel.create({
      userId: user.id,
      name: taskData.taskName,
      description: taskData.taskDesc,
      dueDate: moment(taskData.dueDate).toDate()
    });

    return {taskId: tasks.dataValues.id.toString()};
  }

  private async getUser (email){
    // Check if user exist
    const user = await this.userModel.findOne({
      where: { email },
    });

    return user;
  }
}
