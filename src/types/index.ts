declare global {
    type UserRole = 'ADMIN' | 'USER' | 'VENDOR';
    type StatusVerification = 'PENDING' | 'APPROVE' | 'REJECTED';

    interface IAddress {
        provinceCode?: string;
        provinceName?: string;
        communeCode?: string;
        communeName?: string;
        detailAddress?: string;
        fullAddress?: string;
    }

    interface IUser {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        avatarUrl?: string;
        role: UserRole;
        createdAt: string;
        active: boolean;
        address?: IAddress;
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
        avatar?: File | string;
        phoneNumber?: string;
        provinceCode?: string;
        communeCode?: string;
        detailAddress?: string;
    }

    interface IAddAccountPayload {
        fullName: string;
        email: string;
        password: string;
        phoneNumber: string;
        provinceCode?: string;
        communeCode?: string;
        detailAddress?: string;
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
        image?: File | string;
        parentId?: string;
        description?: string;
    }
    interface IUpdateCategoryPayload {
        id: string;
        name?: string;
        image?: File | string;
        parentId?: string;
        description?: string;
    }
    interface IShop {
        id: string;
        description: string;
        address: string;
        email: string;
        rating: number;
        vendor_id: string;
        shop_name: string;
        logo_url: string;
        phone_number: string;
        is_verified: boolean;
        rejection_reason?: string;
        created_at: string;
        updated_at: string;
    }
    interface ICreateUpdateShopPayload {
        shopName: string;
        description: string;
        address: string;
        phoneNumber: string;
        email: string;
        logo?: File | string;
    }
    interface IVerifyShopPayload {
        shopId: string;
        status: boolean;
        rejectionReason?: string;
    }
}


