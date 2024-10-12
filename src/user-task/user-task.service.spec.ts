import { Test, TestingModule } from '@nestjs/testing';
import { SendNotificationService } from './send-notification.service';
import { getModelToken } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { User } from 'shared/schemas/User.schema';
import { UserSettings } from 'shared/schemas/UserSettings.schema';
import { Notifications } from 'shared/schemas/Notifications.schema';
import { Companies } from 'shared/schemas/Companies.schema';
import { of, throwError } from 'rxjs';
import mongoose from 'mongoose';
import { SendNotificationPayload } from './types/types';
import {
  NotificationChannel,
  NotificationType,
} from 'shared/types/notification.types';

describe('SendNotificationService', () => {
  let sendNotificationService: SendNotificationService;
  let profileClient: ClientProxy;
  let userModel: any;
  let userSettingsModel: any;
  let notificationsModel: any;
  let companiesModel: any;

  const mockUserModel = {
    insertMany: jest.fn(),
  };

  const mockUserSettingsModel = {
    insertMany: jest.fn(),
  };

  const mockNotificationsModel = {
    find: jest.fn(),
    insertMany: jest.fn(),
  };

  const mockCompaniesModel = {
    save: jest.fn(),
  };

  const mockProfileClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SendNotificationService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(UserSettings.name),
          useValue: mockUserSettingsModel,
        },
        {
          provide: getModelToken(Notifications.name),
          useValue: mockNotificationsModel,
        },
        {
          provide: getModelToken(Companies.name),
          useValue: mockCompaniesModel,
        },
        {
          provide: 'PROFILE',
          useValue: mockProfileClient,
        },
      ],
    }).compile();

    sendNotificationService = moduleRef.get<SendNotificationService>(
      SendNotificationService,
    );
    profileClient = moduleRef.get<ClientProxy>('PROFILE');
    userModel = moduleRef.get(getModelToken(User.name));
    userSettingsModel = moduleRef.get(getModelToken(UserSettings.name));
    notificationsModel = moduleRef.get(getModelToken(Notifications.name));
    companiesModel = moduleRef.get(getModelToken(Companies.name));
  });

  describe('sendNotification', () => {
    it('should send notification and save to database', async () => {
      const sendNotificationPayload: SendNotificationPayload = {
        username: 'testUser',
        notificationType: NotificationType.HappyBirthday,
      };

      const userProfile = {
        id: '123456789012345678901234', // Mock a hex string of 24 characters for mongoDB object ID
        username: 'testUser',
        companyName: 'TestCompany',
        channel: 'Email',
      };

      const sendNotificationResp = {
        isNotified: true,
        notifications: [
          {
            channel: NotificationChannel.Email,
            content: 'Happy Birthday!',
            subject: 'Birthday Wishes',
          },
        ],
      };

      // Mock the values
      jest.spyOn(profileClient, 'send').mockReturnValue(of(userProfile));
      jest.spyOn(userModel, 'insertMany').mockResolvedValue([]);
      jest.spyOn(notificationsModel, 'insertMany').mockResolvedValue([]);
      jest.spyOn(notificationsModel, 'find').mockResolvedValue([]);

      // Mocking strategy
      const strategy = {
        sendNotification: jest.fn().mockResolvedValue(sendNotificationResp),
      };

      sendNotificationService['strategies'].set(
        NotificationType.HappyBirthday,
        strategy as any,
      );

      const result = await sendNotificationService.sendNotification(
        sendNotificationPayload,
      );

      expect(result).toBe('User notified');
      expect(notificationsModel.insertMany).toHaveBeenCalled();
    });

    it('should throw error if unknown notification type', async () => {
      const sendNotificationPayload = {
        username: 'testUser',
        notificationType: 'UnknownType' as any, // Use type assertion to bypass TypeScript for testing
      };

      await expect(
        sendNotificationService.sendNotification(sendNotificationPayload),
      ).rejects.toThrow('Unknown notification type');
    });

    it('should handle profileClient.send error', async () => {
      const sendNotificationPayload = {
        username: 'testUser',
        notificationType: NotificationType.HappyBirthday,
      };

      jest
        .spyOn(profileClient, 'send')
        .mockReturnValue(
          throwError(() => new Error('Error fetching user profile')),
        );

      await expect(
        sendNotificationService.sendNotification(sendNotificationPayload),
      ).rejects.toThrow('Error fetching user profile');
    });
  });

  describe('getNotifcations', () => {
    it('should get notifications from database', async () => {
      const getNotificationRequest = {
        username: 'testUser',
      };

      const userProfile = {
        id: '123456789012345678901234',
      };

      const notifications = [
        {
          contents: {
            content: 'Notification Content',
          },
        },
      ];

      jest.spyOn(profileClient, 'send').mockReturnValue(of(userProfile));
      jest.spyOn(notificationsModel, 'find').mockResolvedValue(notifications);

      const result = await sendNotificationService.getNotifcations(
        getNotificationRequest,
      );

      expect(result).toEqual(['Notification Content']);
    });

    it('should handle profileClient.send error in getNotifcations', async () => {
      const getNotificationRequest = {
        username: 'testUser',
      };

      jest
        .spyOn(profileClient, 'send')
        .mockReturnValue(
          throwError(() => new Error('Error fetching user profile')),
        );

      await expect(
        sendNotificationService.getNotifcations(getNotificationRequest),
      ).rejects.toThrow('Error fetching user profile');
    });
  });
});
