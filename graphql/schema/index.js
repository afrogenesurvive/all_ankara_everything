

const { buildSchema } = require('graphql');

module.exports = buildSchema(`

  type User {
    _id: ID
    password: String
    name: String
    role: String
    type: String
    username: String
    dob: String
    age: Int
    addresses: [UserAddress]
    contact: UserContact
    bio: String
    interests: [String]
    points: Float
    loggedIn: Boolean
    clientConnected: Boolean
    verification: UserVerification
    wishlist: [Product]
    liked: [Product]
    cart: [Product]
    reviews: [Review]
    orders: [Order]
    paymentInfo: [UserPaymentInfo]
    affiliate: UserAffiliate
    activity: UserActivity
  }
  type UserAddress {
    type: String
    number: Int
    street: String
    town: String
    city: String
    country: String
    postalCode: String
    primary: Boolean
  }
  type UserContact {
    phone: String
    email: String
  }
  type UserVerification {
    verified: Boolean
    type: String
    code: String
  }
  type UserPaymentInfo {
    date: String
    type: String
    description: String
    body: String
    valid: Boolean
    primary: Boolean
  }
  type UserActivity {
    date: String
    request: String
  }
  type UserAffiliate {
    referrer: User
    code: String
    referees: [UserAffiliateReferees]
    reward: Float
  }
  type UserAffiliateReferees {
    date: String
    referee: User
  }
  input UserInput {
    password: String
    name: String
    role: String
    type: String
    username: String
    dob: String
    age: String
    verificationVerified: Boolean
    verificationType: String
    verificationCode: String
    addressType: String
    addressNumber: Int
    addressStreet: String
    addressTown: String
    addressCity: String
    addressCountry: String
    addressPostalCode: String
    addressPrimary: Boolean
    contactPhone: String
    contactEmail: String
    bio: String
    interest: String
    interests: String
    points: Float
    paymentInfoDate: String
    paymentInfoType: String
    paymentInfoDescription: String
    paymentInfoBody: String
    paymentInfoValid: Boolean
    paymentInfoPrimary: Boolean
  }


  type Order {
    _id: ID
    date: String
    time: String
    type: String
    subType: String
    buyer: User
    products: [Product]
    tax: OrderTax
    shipping: OrderShipping
    total: Float
    description: String
    notes: String
    payment: String
    billingAddress: OrderAddress
    shippingAddress: OrderAddress
    status: OrderStatus
    feedback: String
  }
  type OrderTax {
    description: String
    amount: Float
  }
  type OrderShipping {
    description: String
    amount: Float
  }
  type OrderAddress {
    number: Int
    street: String
    town: String
    city: String
    country: String
    postalCode: String
  }
  type OrderStatus {
    cancelled: OrderStatusObject
    held: OrderStatusObject
    paid: OrderStatusObject
    checkedOut: OrderStatusObject
    emailSent: OrderStatusObject
    confirmed: OrderStatusObject
    packaged: OrderStatusObject
    shipped: OrderStatusObject
    delivered: OrderStatusObject
    confirmedDelivery: OrderStatusObject
  }
  type OrderStatusObject {
    value: Boolean
    date: String
  }
  input OrderInput {
    date: String
    time: String
    type: String
    subType: String
    taxAmount: Float
    taxDescription: String
    shippingAmount: Float
    shippingDescription: String
    total: Float
    description: String
    note: String
    notes: String
    payment: String
    addressType: String
    billingAddressNumber: Int
    billingAddressStreet: String
    billingAddressTown: String
    billingAddressCity: String
    billingAddressCountry: String
    billingAddressPostalCode: String
    shippingAddressNumber: Int
    shippingAddressStreet: String
    shippingAddressTown: String
    shippingAddressCity: String
    shippingAddressCountry: String
    shippingAddressPostalCode: String
    status: String
    statusType: String
    statusValue: Boolean
    statusDate: String
    feedback: String
  }

  type Image {
    name: String
    type: String
    link: String
  }
  type File {
    name: String
    type: String
    link: String
  }

  type Product {
    _id: ID
    public: Boolean
    name: String
    subtitle: String
    aaeId: String
    sku: String
    dateAdded: String
    type: String
    subType: String
    category: String
    description: String
    variant: [String]
    size: String
    dimensions: String
    price: Float
    points: Float
    quantity: Int
    inStock: Boolean
    tags: [String]
    unit: String
    delivery: String
    images: [Image]
    files: [File]
    listedBy: User
    likers: [User]
    buyers: [User]
    wishlisters: [User]
    reviews: [Review]
    orders: [Order]
  }
  input ProductInput {
    public: Boolean
    name: String
    subtitle: String
    aaeId: String
    sku: String
    type: String
    subType: String
    category: String
    description: String
    variant: String
    size: String
    dimensions: String
    price: Float
    points: Float
    quantity: Int
    inStock: Boolean
    tag: String
    tags: String
    unit: String
    delivery: String
    imageName: String
    imageType: String
    imageLink: String
    fileName: String
    fileType: String
    fileLink: String
  }

  type Review {
    _id: ID!
    date: String
    type: String
    title: String
    product: Product
    author: User
    body: String
    rating: Float
  }
  input ReviewInput {
    date: String,
    type: String,
    title: String,
    body: String,
    rating: Float
  }

  type AuthData {
    activityId: ID!
    role: String!
    token: String
    tokenExpiration: Int!
    error: String
  }

  type RootQuery {
    testEmail: String

    login(email: String!, password: String!): AuthData!
    logout( activityId: ID!): User!

    getPocketVars(activityId: ID!): String

    getAllUsers(activityId: ID!): [User]
    getUserById(activityId: ID!, userId: ID!): User
    getUsersByField(activityId: ID!, field: String!, query: String!): [User]
    getUsersByFieldRegex(activityId: ID!, field: String!, query: String!): [User]
    getUsersByInterests(activityId: ID!, userInput: UserInput!): [User]
    getUsersByPointRange(activityId: ID!, upper: Float!,lower: Float!): [User]
    getThisUser(activityId: ID!): User
    getUsersByLikedProducts(activityId: ID!, productIds: String!): [User]
    getUsersByWishListItems(activityId: ID!, productIds: String!): [User]
    getUsersByCartItems(activityId: ID!, productIds: String!): [User]
    getUserByReview(activityId: ID!, reviewId: ID!): User
    getUserByOrder(activityId: ID!, orderId: ID!): User

    getAllProducts(activityId: ID!): [Product]
    getProductById(activityId: ID!, productId: ID!): Product
    getProductsByField(activityId: ID!, field: String!, query: String!): [Product]
    getProductsByFieldRegex(activityId: ID!, field: String!, query: String!): [Product]
    getProductsByTags(activityId: ID!, productInput: ProductInput!): [Product]
    getProductsByPointRange(activityId: ID!, upper: Float!,lower: Float!): [Product]
    getProductsByLikers(activityId: ID!, userIds: String!, public: Boolean!): [Product]
    getProductsByBuyers(activityId: ID!, userIds: String!, public: Boolean!): [Product]
    getProductsByWishlisters(activityId: ID!, userIds: String!, public: Boolean!): [Product]
    getProductsByReviews(activityId: ID!, reviewIds: String!, public: Boolean!): [Product]
    getProductByOrders(activityId: ID!, orderIds: String!, public: Boolean!): [Product]

    getAllOrders(activityId: ID!): [Order]
    getOrderById(activityId: ID!, orderId: ID!): Order
    getOrdersByField(activityId: ID!, field: String!, query: String!): [Order]
    getOrdersByFieldRegex(activityId: ID!, field: String!, query: String!): [Order]
    getOrdersByBillingAddress(activityId: ID!, orderInput: OrderInput!): [Order]
    getOrdersByShippingAddress(activityId: ID!, orderInput: OrderInput!): [Order]
    getOrdersByStatus(activityId: ID!, orderInput: OrderInput!): [Order]

    getAllReviews(activityId: ID!): [Review]
    getReviewById(activityId: ID!, reviewId: ID!): Review
    getReviewsByField(activityId: ID!, field: String!, query: String!): [Review]
    getReviewsByFieldRegex(activityId: ID!, field: String!, query: String!): [Review]
    getReviewsByProduct(activityId: ID!, productId: ID!): [Review]
    getReviewsByAuthor(activityId: ID!, userId: ID!): [Review]

  }

  type RootMutation {

    requestPasswordReset(userInput: UserInput! ): User
    resetUserPassword(userId: ID!, verification: String!, userInput: UserInput!):User

    createUser(userInput: UserInput!): User
    updateUserAllFields(activityId: ID!, userId: ID!, userInput: UserInput!): User
    updateUserSingleField(activityId: ID!, userId: ID!, field: String!, query: String!): User
    addUserAddress(activityId: ID!, userId: ID!, userInput: UserInput!): User
    setUserAddressPrimary(activityId: ID, userId: ID!, userInput: UserInput!): User
    addUserPaymentInfo(activityId: ID!, userId: ID!, userInput: UserInput): User
    setUserPaymentInfoPrimary(activityId: ID!, userId: ID!, userInput: UserInput!): User
    addUserInterests(activityId: ID!, userId: ID!, userInput: UserInput!): User
    addUserPoints(activityId: ID!, userId: ID!, userInput: UserInput!): User
    addUserLikedProduct(activityId: ID!, userId: ID!, productId: ID!): User
    addUserWishlistItem(activityId: ID!, userId: ID!, productId: ID!): User
    addUserCartProduct(activityId: ID!, userId: ID!, productId: ID!): User
    addUserOrder(activityId: ID!, userId: ID!, orderId: ID!): User
    addUserReview(activityId: ID!, userId: ID!, reviewId: ID!): User
    addUserActivity(activityId: ID!, userId: ID!, activity: String!): User

    verifyUser( userInput: UserInput!): User
    userOnline(activityId: ID!, userId: ID! ): User
    userOffline(activityId: ID!, userId: ID! ): User

    becomeAffiliate(activityId: ID!, userInput: UserInput!): User
    addAffiliateReferrer(activityId: ID!, userInput: UserInput!): User
    addAffiliateReferree(activityId: ID!, userInput: UserInput!): User

    deleteUserById(activityId: ID!, userId: ID!): User
    deleteUserInterest(activityId: ID!, userId: ID!, userInput: UserInput!): User
    deleteUserPaymentInfo(activityId: ID!, userId: ID!, userInput: UserInput!): User
    deleteUserAddress(activityId: ID!, userId: ID!, userInput: UserInput!): User
    deleteUserLikedProduct(activityId: ID!, userId: ID!, productId: ID!): User
    deleteUserWishlistItem(activityId: ID!, userId: ID!, productId: ID!): User
    deleteUserCartProduct(activityId: ID!, userId: ID!, productId: ID!): User
    deleteUserActivity(activityId: ID!, userId: ID!, userInput: UserInput!): User
    deleteUserReview(activityId: ID!, userId: ID!, reviewId: ID!): User
    deleteUserOrder(activityId: ID!, userId: ID!, orderId: ID!): User


    createProduct(activityId: ID!, productInput: ProductInput!): Product
    updateProductAllFields(activityId: ID!, productId: ID!, productInput: ProductInput!): Product
    updateProductSingleField(activityId: ID!, productId: ID!, field: String!, query: String!): Product
    addProductTags(activityId: ID!, productId: ID!, productInput: ProductInput!): Product
    addProductImage(activityId: ID!, productId: ID!, productInput: ProductInput!): Product
    addProductFile(activityId: ID!, productId: ID!, productInput: ProductInput!): Product
    addProductLiker(activityId: ID!, productId: ID!, userId: ID!): Product
    addProductBuyer(activityId: ID!, productId: ID!, userId: ID!): Product
    addProductWishlister(activityId: ID!, productId: ID!, userId: ID!): Product
    addProductReview(activityId: ID!, productId: ID!, reviewId: ID!): Product
    addProductOrder(activityId: ID!, productId: ID!, orderId: ID!): Product

    deleteProductById(activityId: ID!, productId: ID!): Product
    deleteProductTag(activityId: ID!, productId: ID!, productInput: ProductInput!): Product
    deleteProductImage(activityId: ID!, productId: ID!, productInput: ProductInput!): Product
    deleteProductFile(activityId: ID!, productId: ID!, productInput: ProductInput!): Product
    deleteProductLiker(activityId: ID!, productId: ID!, userId: ID!): Product
    deleteProductBuyer(activityId: ID!, productId: ID!, userId: ID!): Product
    deleteProductWishlister(activityId: ID!, productId: ID!, userId: ID!): Product
    deleteProductReview(activityId: ID!, productId: ID!, reviewId: ID!): Product
    deleteProductOrder(activityId: ID!, productId: ID!, orderId: ID!): Product


    createOrder(activityId: ID!, buyerId:ID!, orderInput: OrderInput!): Order
    updateOrderSingleField(activityId: ID!, orderId: ID!, field: String!, query: String!): Order
    updateOrderShipping(activityId: ID!, orderId: ID!, orderInput: OrderInput!): Order
    updateOrderBillingAddress(activityId: ID!, orderId: ID!, orderInput: OrderInput!): Order
    updateOrderShippingAddress(activityId: ID!, orderId: ID!, orderInput: OrderInput!): Order

    updateOrderStatus(activityId: ID!, orderId: ID!, orderInput: OrderInput!): Order

    deleteOrderById(activityId: ID!, orderId: ID!): Order
    deleteOrderStatus(activityId: ID!, orderId: ID!, orderInput: OrderInput!):Order


    createReview(activityId: ID!, userId: ID, productId: ID!, reviewInput: ReviewInput!): Review
    updateReviewSingleField(activityId: ID!, reviewId: ID!, field: String!, query: String!): Review

    deleteReview(activityId: ID!, reviewId: ID!): Review

  }

  schema {
      query: RootQuery
      mutation: RootMutation
  }
`);
