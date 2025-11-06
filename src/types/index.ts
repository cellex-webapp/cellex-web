declare global {
    type UserRole = 'ADMIN' | 'USER' | 'VENDOR';
    type StatusVerification = 'PENDING' | 'APPROVED' | 'REJECTED';
    type DataType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT';
    type CartUpdateAction = 'INCREASE' | 'DECREASE';

    interface IAddressDataUnit {
        code: string;
        name: string;
    }

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
        attributes?: IAttribute[];
    }

    interface ICreateCategoryPayload {
        name: string;
        image?: File | string;
        parentId?: string;
        description?: string;
        isActive?: boolean;
    }
    interface IUpdateCategoryPayload {
        id: string;
        name?: string;
        image?: File | string;
        parentId?: string;
        description?: string;
        isActive?: boolean;
    }
    interface IShop {
        id: string;
        description: string;
        address: IAddress;
        email: string;
        status: StatusVerification;
        rating: number;
        vendor_id: string;
        shop_name: string;
        logo_url: string;
        phone_number: string;
        rejection_reason?: string;
        product_count?: number;
        created_at: string;
        updated_at: string;
    }
    interface ICreateUpdateShopPayload {
        shopName: string;
        description: string;
        provinceCode: string;
        communeCode: string;
        detailAddress: string;
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
        shopInfo?: IShop;
        categoryInfo?: ICategory;
    }

    interface ICreateProductPayload {
        categoryId: string;
        name: string;
        description?: string;
        price: string | number;
        saleOff?: string | number;
        stockQuantity: string | number;
        attributeValues?: Array<{ attributeId: string; value: string }> | string;
        isPublished?: boolean | string;
        images?: File[];
    }

    interface IUpdateProductPayload {
        categoryId?: string;
        name?: string;
        description?: string;
        price?: string | number;
        saleOff?: string | number;
        stockQuantity?: string | number;
        attributeValues?: Array<{ attributeId: string; value: string }> | string;
        isPublished?: boolean | string;
        images?: File[];
    }

    interface IAddToCartRequest {
        productId: string;
        quantity: number;
    }

    interface IUpdateCartItemQuantityRequest {
        productId: string;
        action: CartUpdateAction;
    }

    interface ISetCartItemQuantityRequest {
        productId: string;
        quantity: number;
    }

    interface IRemoveFromCartRequest {
        productIds: string[];
    }

    interface ICartItem {
  productId: string;
  productName: string;    
  productImage: string;   
  quantity: number;
  price: number;          
  subtotal: number;       
  shopId: string;
  shopName: string;
  availableStock: number; 
  isAvailable: boolean;
}

    interface ICart {
        id: string;
        userId: string;
        items: ICartItem[];
        totalQuantity: number;
        totalPrice: number;
        createdAt: string;
        updatedAt: string;
    }

    interface ICartState {
        cart: ICart | null;
        isLoading: boolean;
        error: string | null;
    }
}


