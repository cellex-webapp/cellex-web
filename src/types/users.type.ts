declare global {
    interface IUser {
      userId: string;
      fullName?: string;
      email?: string;
      password?: string;
      phoneNumber?: string;
      avatarUrl?: string;
      role?: string; 
      addresses?: IAddress[];
      customerSegmentId?: string;
      isActive?: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    }

    interface LoginCredentials {
      email: string;
      password: string;
    }

    interface ILoginResponse {
      access_token: string;
      refresh_token: string;
      role: string;
    }
}






