import * as moment from "moment";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from 'src/shared/models/task.model';
import { User } from 'src/shared/models/user.model';
import { GetTaskPayload, GetTaskResp } from 'src/shared/types/task-service.dto';

@Injectable()
export class UserTaskService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Task) private taskModel: typeof Task,
  ) {}

  async getTasks(getTaskPayload: GetTaskPayload): Promise<GetTaskResp[]> {
    console.log(getTaskPayload);
    // Check if user exist
    const user = await this.userModel.findOne({
      where: { email: getTaskPayload.email },
    });

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

  // // Example method to create a task
  // async createTask(taskData: Partial<Task>): Promise<Task> {
  //   return this.taskModel.create(taskData);
  // }
}
