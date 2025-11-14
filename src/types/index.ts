declare global {
    type UserRole = 'ADMIN' | 'USER' | 'VENDOR';
    type StatusVerification = 'PENDING' | 'APPROVED' | 'REJECTED';
    type DataType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT';
    type CartUpdateAction = 'INCREASE' | 'DECREASE';
    type CouponType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
    type DistributionType = 'SHARED_CODE' | 'UNIQUE_PER_USER';
    type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    type UserCouponStatus = 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
    type ShopStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
    type DiscountType = 'PERCENTAGE' | 'FIXED';
    type ScheduleFrequency = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
    type PaymentMethod = 'COD';

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

    interface CreateCampaignRequest {
        title: string;
        description?: string;
        codeTemplate?: string;
        couponType: CouponType;
        discountValue: number;
        minOrderAmount?: number;
        maxDiscountAmount?: number;
        startDate: string;
        endDate: string;
        distributionType: DistributionType;
        maxTotalIssuance?: number;
        perUserLimit?: number;
        applicableProductIds?: string[];
        note?: string;
        scheduledAt?: string;
    }

    type UpdateCampaignRequest = Partial<CreateCampaignRequest>;

    interface DistributeFilter {
        all?: boolean;
        customerSegmentId?: string;
        minTotalSpend?: number;
        maxTotalSpend?: number;
        registeredBefore?: string;
        registeredAfter?: string;
        city?: string;
        district?: string;
        explicitUserIds?: string[];
        excludeUserIds?: string[];
    }

    interface DistributeCampaignRequest {
        campaignId: string;
        filter: DistributeFilter;
    }

    interface CouponCampaignResponse {
        id: string;
        title: string;
        description: string | null;
        codeTemplate: string | null;
        couponType: CouponType;
        discountValue: number;
        minOrderAmount: number | null;
        applicableProductIds: string[] | null;
        applicableCategoryIds: string[] | null;
        startDate: string;
        endDate: string;
        distributionType: DistributionType;
        maxTotalIssuance: number | null;
        perUserLimit: number;
        currentIssuance: number;
        status: CampaignStatus;
        scheduledAt: string | null;
        distributedAt: string | null;
        isActive: boolean;
        createdBy: string;
        note: string | null;
        createdAt: string;
        updatedAt: string;
    }

    interface CampaignDistributionResponse {
        id: string;
        campaignId: string;
        campaignTitle: string | null;
        adminId: string;
        filterCriteria: DistributeFilter;
        recipientsCount: number;
        successCount: number;
        failedCount: number;
        errorSummary: string;
        executionTimeMs: number;
        createdAt: string;
    }

    interface IUserCoupon {
        id: string;
        userId: string;
        segmentCouponId: string | null;
        campaignId: string;
        code: string;
        title: string | null;
        description: string | null;
        couponType: CouponType;
        discountValue: number;
        minOrderAmount: number | null;
        applicableProductIds: string[] | null;
        applicableCategoryIds: string[] | null;
        issuedDate: string;
        expiresAt: string;
        status: UserCouponStatus;
        redeemedOrderId: string | null;
        redeemedAt: string | null;
        issuedVia: string;
        issuedBy: string;
        createdAt: string;
        updatedAt: string;

    }
    interface ICouponState {
        campaigns: CouponCampaignResponse[];
        selectedCampaign: CouponCampaignResponse | null;
        logs: CampaignDistributionResponse[];
        myCoupons: IUserCoupon[];
        isLoading: boolean;
        error: string | null;
    }

    // Orders
    interface IOrderItem {
        price: number;
        quantity: number;
        subtotal: number;
        product_id: string;
        product_name: string;
        product_image?: string;
    }

    interface IOrderStatusHistoryEntry {
        status: OrderStatus;
        note: string | null;
        updated_by: string;
        updated_at: string;
    }

    interface IOrder {
        id: string;
        items: IOrderItem[];
        subtotal: number;
        status: OrderStatus;
        note?: string | null;
        user_id: string;
        shop_id: string;
        shop_name: string;
        shipping_address: IAddress | null;
        shipping_fee: number;
        discount_amount: number;
        total_amount: number;
        coupon_code: string | null;
        payment_method: PaymentMethod | null;
        is_paid: boolean;
        paid_at: string | null;
        status_history: IOrderStatusHistoryEntry[];
        cancel_reason: string | null;
        cancelled_at: string | null;
        confirmed_at: string | null;
        shipping_at: string | null;
        delivered_at: string | null;
        created_at: string;
        updated_at: string;
    }

    interface ApplyCouponRequest {
        code: string;
    }

    interface CheckoutOrderRequest {
        paymentMethod: PaymentMethod;
    }

    // For creation from product or from cart
    interface CreateOrderRequest {
        // If from product
        productId?: string;
        quantity?: number;
        // If from cart
        cartItemIds?: string[];
        // Optional override
        note?: string;
    }

    interface AvailableCouponResponse {
        id: string;
        code: string;
        title: string | null;
        description: string | null;
        couponType: CouponType;
        discountValue: number;
        minOrderAmount?: number | null;
        estimatedDiscountAmount?: number | null;
        expiresAt?: string | null;
    }

    interface IOrderState {
        myOrders: IPage<IOrder> | null;
        shopOrders: IPage<IOrder> | null;
        adminOrders: IPage<IOrder> | null;
        selectedOrder: IOrder | null;
        availableCoupons: AvailableCouponResponse[];
        isLoading: boolean;
        error: string | null;
    }

    

    interface CustomerSegmentResponse {
        id: string;
        name: string;
        minSpend: number;
        maxSpend: number | null;
        level: number;
        description: string | null;
        createdAt: string;
        updatedAt: string;
    }
    interface ICustomerSegmentState {
        segments: CustomerSegmentResponse[];
        selectedSegment: CustomerSegmentResponse | null;
        isLoading: boolean;
        error: string | null;
    }

    interface IUpdateMyShopPayload {
        shopName?: string;
        description?: string;
        provinceCode?: string;
        communeCode?: string;
        detailAddress?: string;
        phoneNumber?: string;
        email?: string;
        logo?: File;
    }

    interface IShopState {
        myShop: IShop | null;
        isLoading: boolean;
        error: string | null;
    }

    // Segment Coupons
    interface CreateSegmentCouponRequest {
        segmentId: string;
        codePrefix: string;
        title: string;
        description?: string;
        discountType: DiscountType;
        discountValue: number;
        minOrderAmount?: number;
        validHours?: number; // hours coupon valid since issuance
        isActive: boolean;
        isAutoOnUpgrade: boolean;
        scheduleFrequency: ScheduleFrequency;
        // Conditional schedule fields
        scheduleDayOfWeek?: DayOfWeek; // for WEEKLY
        scheduleDayOfMonth?: number; // for MONTHLY 1-31
        scheduleMonthDay?: string; // for YEARLY format MM-DD
        scheduleTime?: string; // HH:mm:ss
        maxUsesPerUser?: number | null; // null means unlimited
    }

    type UpdateSegmentCouponRequest = Partial<CreateSegmentCouponRequest>;

    interface SegmentCouponResponse {
        id: string;
        segmentId: string;
        codePrefix: string;
        title: string;
        description?: string | null;
        discountType: DiscountType;
        discountValue: number;
        minOrderAmount?: number | null;
        validHours?: number | null;
        isActive: boolean;
        isAutoOnUpgrade: boolean;
        scheduleFrequency: ScheduleFrequency;
        scheduleDayOfWeek?: DayOfWeek | null;
        scheduleDayOfMonth?: number | null;
        scheduleMonthDay?: string | null;
        scheduleTime?: string | null;
        maxUsesPerUser?: number | null;
        nextScheduledDate?: string | null;
        createdAt: string;
        updatedAt: string;
    }

    interface SegmentCouponState {
        items: SegmentCouponResponse[];
        selected: SegmentCouponResponse | null;
        bySegment: Record<string, SegmentCouponResponse[]>;
        isLoading: boolean;
        error: string | null;
    }

    interface CreateCustomerSegmentRequest {
        name: string;
        description?: string;
        minSpend: number;
        maxSpend?: number | null;
        level: number;
    }
    
    type UpdateCustomerSegmentRequest = Partial<CreateCustomerSegmentRequest>;
}

export {}





