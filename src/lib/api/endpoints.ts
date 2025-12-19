/**
 * API Endpoints - Baseado em lib/utill/app_constants.dart do Flutter
 */
export const API_ENDPOINTS = {
  // Config
  CONFIG: '/api/v1/config',
  DELIVERY_INFO: '/api/v1/config/delivery-fee',

  // Auth
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  CHECK_PHONE: '/api/v1/auth/check-phone',
  VERIFY_PHONE: '/api/v1/auth/verify-phone',
  VERIFY_OTP: '/api/v1/auth/verify-otp',
  CHECK_EMAIL: '/api/v1/auth/check-email',
  VERIFY_EMAIL: '/api/v1/auth/verify-email',
  VERIFY_TOKEN: '/api/v1/auth/verify-token',
  FIREBASE_AUTH_VERIFY: '/api/v1/auth/firebase-auth-verify',
  SOCIAL_LOGIN: '/api/v1/auth/social-customer-login',
  REGISTER_WITH_OTP: '/api/v1/auth/registration-with-otp',
  EXISTING_ACCOUNT_CHECK: '/api/v1/auth/existing-account-check',
  REGISTER_WITH_SOCIAL: '/api/v1/auth/registration-with-social-media',

  // Products
  PRODUCTS_ALL: '/api/v1/products/all',
  PRODUCT_DETAILS: '/api/v1/products/details',
  PRODUCTS_FEATURED: '/api/v1/products/featured',
  PRODUCTS_MOST_REVIEWED: '/api/v1/products/most-reviewed',
  PRODUCTS_DAILY_NEEDS: '/api/v1/products/daily-needs',
  PRODUCTS_SEARCH: '/api/v1/products/search',
  PRODUCT_REVIEW_SUBMIT: '/api/v1/products/reviews/submit',
  WISHLIST: '/api/v1/products/favorite',

  // Categories
  CATEGORIES: '/api/v1/categories',
  CATEGORY_CHILDREN: '/api/v1/categories/childes',
  CATEGORY_PRODUCTS: '/api/v1/categories/products',
  CATEGORY_ALL_PRODUCTS: '/api/v1/categories/products', // + /{category_id}/all

  // Banners & Deals
  BANNERS: '/api/v1/banners',
  FLASH_DEALS: '/api/v1/flash-deals',

  // Orders
  ORDER_LIST: '/api/v1/customer/order/list',
  ORDER_DETAILS: '/api/v1/customer/order/details',
  ORDER_PLACE: '/api/v1/customer/order/place',
  ORDER_CANCEL: '/api/v1/customer/order/cancel',
  ORDER_TRACK: '/api/v1/customer/order/track',
  TIME_SLOTS: '/api/v1/timeSlot',

  // Customer
  CUSTOMER_INFO: '/api/v1/customer/info',
  CUSTOMER_UPDATE_PROFILE: '/api/v1/customer/update-profile',
  CUSTOMER_REMOVE: '/api/v1/customer/remove-account',
  VERIFY_PROFILE_INFO: '/api/v1/customer/verify-profile-info',
  CHANGE_LANGUAGE: '/api/v1/customer/change-language',

  // Address
  ADDRESS_LIST: '/api/v1/customer/address/list',
  ADDRESS_ADD: '/api/v1/customer/address/add',
  ADDRESS_UPDATE: '/api/v1/customer/address/update',
  ADDRESS_DELETE: '/api/v1/customer/address/delete',
  LAST_ORDERED_ADDRESS: '/api/v1/customer/last-ordered-address',

  // Wallet & Loyalty
  WALLET_TRANSACTIONS: '/api/v1/customer/wallet-transactions',
  LOYALTY_TRANSACTIONS: '/api/v1/customer/loyalty-point-transactions',
  LOYALTY_TRANSFER: '/api/v1/customer/transfer-point-to-wallet',
  WALLET_BONUS_LIST: '/api/v1/customer/bonus/list',

  // Coupon
  COUPON_LIST: '/api/v1/coupon/list',
  COUPON_APPLY: '/api/v1/coupon/apply',

  // Chat/Messaging
  CHAT_ADMIN_GET: '/api/v1/customer/message/get-admin-message',
  CHAT_ADMIN_SEND: '/api/v1/customer/message/send-admin-message',
  CHAT_DELIVERY_GET: '/api/v1/customer/message/get-order-message',
  CHAT_DELIVERY_SEND: '/api/v1/customer/message/send/customer',

  // Notifications
  NOTIFICATIONS: '/api/v1/notifications',
  FCM_TOKEN: '/api/v1/customer/cm-firebase-token',

  // Map/Location
  DISTANCE_MATRIX: '/api/v1/mapapi/distance-api',
  PLACE_AUTOCOMPLETE: '/api/v1/mapapi/place-api-autocomplete',
  PLACE_DETAILS: '/api/v1/mapapi/place-api-details',
  GEOCODE: '/api/v1/mapapi/geocode-api',

  // Delivery
  DELIVERY_MAN_LOCATION: '/api/v1/delivery-man/last-location',
  DELIVERY_MAN_REVIEW: '/api/v1/delivery-man/reviews/submit',

  // Guest
  GUEST_ADD: '/api/v1/guest/add',

  // Newsletter
  NEWSLETTER_SUBSCRIBE: '/api/v1/subscribe-newsletter',

  // Payment
  OFFLINE_PAYMENT_METHODS: '/api/v1/offline-payment-method/list',

  // Assets / Signed URLs
  // AIDEV-NOTE: Endpoint para obter URLs assinadas do GCS (requer autenticação)
  ASSETS_SIGNED_URL: '/api/v1/assets/signed-url',
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
