declare global {
    type UserRole = 'ADMIN' | 'USER' | 'VENDOR';

    interface IUser {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        avatarUrl?: string;
        role: UserRole;
        createdAt: string;
        active: boolean;
    }

    interface IApiResponse<T> {
        code: number;
        message: string;
        result: T;
    }

    interface ILoginPayload {
        email: string;
        password: string; 
    }
    interface ILoginResponse {
        user: IUser;
        accessToken: string;
        refreshToken: string;
    }

    interface ISendSignupCodePayload {
        email: string;
        fullName: string;
        phoneNumber: string;
        password: string;
        confirmPassword: string; 
    }

    interface IVerifySignupCodePayload {
        email: string;
        otp: string;
    }

    interface IUpdateProfilePayload {
        fullName?: string;
        avatar?: string;
        provinceCode?: string;
        communeCode?: string;
        detailAddress?: string;
    }

    interface IAddAccountPayload {
        fullName: string;
        email: string;
        password: string;
        phoneNumber: string;
        addresses: string;
    }

    interface ICategory {
        id: string;
        name: string;
        slug: string;
        parentId?: string;
        imageUrl: string;
        description?: string;
        isActive: boolean;
        parent: string;
    }

    interface ICreateCategoryPayload {
        name: string;
        image?: string;
        parent?: string;
        active?: boolean;
    }
    interface IUpdateCategoryPayload {
        id: string;
        name?: string;
        image?: string;
        parent?: string;
        active?: boolean;
    }
}


