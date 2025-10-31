declare global {
    type UserRole = 'ADMIN' | 'USER' | 'VENDOR';
    type StatusVerification = 'PENDING' | 'APPROVE' | 'REJECT';
    type DataType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT';

    interface IAddress {
        street?: string;
        commune?: string;
        province?: string;
        country?: string;
        fullAddress?: string;
        default?: boolean;
    }

    interface IUser {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        avatarUrl?: string;
        role: UserRole;
        createdAt: string;
        updatedAt: string;
        active: boolean;
        address?: IAddress;
        banned?: boolean;
        customerSegmentId?: string;
        banReason?: string;
        bannedAt?: string;
        bannedBy?: string;
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
        role: UserRole;
    }

    interface ICategory {
        id: string;
        name: string;
        slug: string;
        parentId?: string;
        imageUrl: string;
        description?: string;
        isActive: boolean;
        parent?: string;
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
        status: StatusVerification;
        rejectionReason?: string;
    }
    interface IAttribute {
        id: string;
        attributeName: string;
        attributeKey: string;
        dataType: string;
        unit: string;
        isRequired: boolean;
        isHighlight: boolean;
        selectOptions?: DataType[];
        sortOrder?: number;
        description?: string;
        isActive?: boolean;
        createdAt?: string;
        updatedAt?: string;
    }
    interface ICreateUpdateAttributePayload {
        attributeName: string;
        attributeKey: string;
        dataType: string;
        unit: string;
        isRequired: boolean;
        isHighlight: boolean;
        selectOptions?: DataType[];
        sortOrder?: number;
        description?: string;
        isActive?: boolean;
    }

    interface IAttributeValue {
        attributeId: string;
        attributeName?: string;
        value: string;
        unit?: string;
        attributeKey?: string;
        dataType?: string;
    }

    interface ISortInfo {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
    }

    interface IPageableInfo {
        pageNumber?: number;
        pageSize?: number;
        sort?: ISortInfo;
        offset?: number;
        unpaged?: boolean;
        paged?: boolean;
    }

    interface IPage<T> {
        totalPages: number;
        totalElements: number;
        size: number;
        content: T[];
        number: number;
        sort?: ISortInfo;
        first?: boolean;
        last?: boolean;
        numberOfElements?: number;
        pageable?: IPageableInfo;
        empty?: boolean;
    }

    interface IPageable {
        page?: number;
        size?: number;
        sort?: string;
    }
    interface IShopInfo {
        id: string;
        shopName: string;
        logoUrl?: string;
        isVerified: boolean;
        rating?: number;
    }

    interface ICategoryInfo {
        id: string;
        name: string;
        imageUrl?: string;
    }

    interface IProduct {
        id: string;
        name: string;
        description?: string;
        categoryId?: string;
        price: number;
        saleOff?: number;
        finalPrice: number;
        stockQuantity: number;
        attributeValues?: IAttributeValue[];
        images?: string[];
        isPublished?: boolean;
        createdAt?: string;
        updatedAt?: string;
        shopId: string;
        averageRating: number;
        reviewCount: number;
        purchaseCount: number;
        shopInfo?: IShopInfo;
        categoryInfo?: ICategoryInfo;
    }
}


