import { createAsyncThunk, createSlice, isPending, isRejectedWithValue } from '@reduxjs/toolkit';
import notificationService from '@/services/notification.service';
import { getErrorMessage } from '@/helpers/errorHandler';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  page: 0,
  size: 20,
  totalPages: 0,
  totalElements: 0,
  isLoading: false,
  error: null,
};

type ThunkConfig = { rejectValue: string };

export const fetchNotifications = createAsyncThunk<NotificationListResponse, { page?: number; size?: number } | undefined, ThunkConfig>(
  'notification/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const resp = await notificationService.getUserNotifications(params?.page, params?.size);
      return resp.result;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk<number, void, ThunkConfig>('notification/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const resp = await notificationService.getUnreadCount();
    return (resp.result as any)?.unreadCount ?? 0;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const markNotificationRead = createAsyncThunk<string, string, ThunkConfig>('notification/markRead', async (id, { rejectWithValue }) => {
  try {
    await notificationService.markAsRead(id);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const markAllNotificationsRead = createAsyncThunk<number, void, ThunkConfig>('notification/markAllRead', async (_, { rejectWithValue }) => {
  try {
    const resp = await notificationService.markAllAsRead();
    return (resp.result as any)?.unreadCount ?? 0;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const registerDeviceToken = createAsyncThunk<Record<string, string>, DeviceTokenRequest, ThunkConfig>(
  'notification/registerDevice',
  async (body, { rejectWithValue }) => {
    try {
      const resp = await notificationService.registerDeviceToken(body);
      return resp.result as Record<string, string>;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const unregisterDeviceToken = createAsyncThunk<string, string, ThunkConfig>(
  'notification/unregisterDevice',
  async (fcmToken, { rejectWithValue }) => {
    try {
      await notificationService.unregisterDeviceToken(fcmToken);
      return fcmToken;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const sendBroadcastNotification = createAsyncThunk<void, BroadcastNotificationRequest, ThunkConfig>(
  'notification/sendBroadcast',
  async (payload, { rejectWithValue }) => {
    try {
      await notificationService.sendBroadcastNotification(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const sendTestNotification = createAsyncThunk<Record<string, string>, void, ThunkConfig>(
  'notification/sendTestNotification',
  async (_, { rejectWithValue }) => {
    try {
      const resp = await notificationService.sendTestNotification();
      return resp.result as Record<string, string>;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const sendTestBroadcast = createAsyncThunk<void, void, ThunkConfig>(
  'notification/sendTestBroadcast',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.sendTestBroadcast();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteNotification = createAsyncThunk<string, string, ThunkConfig>(
  'notification/delete',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotifications(state) {
      state.notifications = [];
      state.totalElements = 0;
      state.totalPages = 0;
      state.unreadCount = 0;
      state.page = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.page = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = state.notifications.map((n: NotificationResponse) =>
          n.id === action.payload ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications = state.notifications.map((n: NotificationResponse) => ({ ...n, isRead: true, readAt: n.readAt || new Date().toISOString() }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      })
      .addMatcher(isPending, (state, action) => {
        if (action.type.startsWith('notification/')) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        if (action.type.startsWith('notification/')) {
          state.isLoading = false;
          state.error = (action.payload as string) || 'Something went wrong';
        }
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
