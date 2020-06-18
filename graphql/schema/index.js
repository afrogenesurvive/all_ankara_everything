

const { buildSchema } = require('graphql');

module.exports = buildSchema(`

  type User {
    _id: ID!
    password: String
    name: String
    role: String
    username: String
    dob: String
    public: Boolean
    age: Int
    addresses: [ProfileAddress]
    contact: Contact
    bio: String
    profileImages: [Image]
    socialMedia: [SocialMedia]
    interests: [String]
    perks: [Perk]
    promos: [Promo]
    friends: [User]
    friendRequests: [FriendRequest]
    points: Float
    affiliate: Affiliate
    tags: [String]
    loggedIn: Boolean
    clientConnected: Boolean
    verification: Verification
    likedLessons: [Lesson]
    bookedLessons: [BookedLessonRef]
    attendedLessons: [LessonRef]
    taughtLessons: [LessonRef]
    toTeachLessons: [Lesson]
    wishlist: [WishlistItem]
    cart: [CartItem]
    orders: [Order]
    paymentInfo: [PaymentInfoItem]
    activity:[Activity]
    comments: [Comment]
    reviews: [Review]
    messages: [Message]
    cancellations: [UserCancellation]
    notifications: [Notification]
  }

  type Address {
    type: String
    number: Int
    street: String
    town: String
    city: String
    country: String
    postalCode: String
  }
  type ProfileAddress {
    type: String
    number: Int
    street: String
    town: String
    city: String
    country: String
    postalCode: String
    primary: Boolean
  }
  type Contact {
    phone: String
    phone2: String
    email: String
  }
  type Image {
    name: String
    type: String
    path: String
    public: Boolean
  }
  type Attachment {
    name: String
    type: String
    path: String
  }
  type SocialMedia {
    platform: String
    handle: String
    link: String
  }
  type Verification {
    verified: Boolean
    type: String
    code: String
  }
  type FriendRequest {
    date: String
    sender: User
    receiver: User
  }
  type Affiliate {
    refferrer: User
    code: String
    referees: [AffiliateReferee]
    reward: Float
  }
  type AffiliateReferee {
    date: String
    referee: User
  }
  type Activity {
    date: String
    request: String
  }
  type LessonRef {
    date: String
    ref: Lesson
  }
  type BookedLessonRef {
    date: String
    session: BookedLessonSession
    ref: Lesson
  }
  type BookedLessonSession {
    title: String
    date: String
    time: String
  }
  type WishlistItem {
    date: String
    ref: Lesson
    booked: Boolean
  }
  type CartItem {
    dateAdded: String
    sessionDate: String
    sessionTitle: String
    lesson: Lesson
  }
  type PaymentInfoItem {
    date: String
    type: String
    description: String
    body: String
    valid: Boolean
    primary: Boolean
  }
  type UserCancellation {
    date: String
    reason: String
    sessionDate: String
    sessionTitle: String
    lesson: Lesson
  }
  input UserInput {
    password: String
    name: String
    role: String
    username: String
    dob: String
    age: Int
    addressType: String
    addressNumber: Int
    addressStreet: String
    addressTown: String
    addressCity: String
    addressCountry: String
    addressPostalCode: String
    addressPrimary: Boolean
    contactPhone: String
    contactPhone2: String
    contactEmail: String
    bio: String
    profileImageName: String
    profileImageType: String
    profileImagePath: String
    profileImagePublic: Boolean
    socialMediaPlatform: String
    socialMediaHandle: String
    socialMediaLink: String
    interest: String
    interests: String
    points: Float
    tag: String
    tags: String
    loggedIn: Boolean
    public: Boolean
    clientConnected: Boolean
    verificationVerified: Boolean
    verificationType: String
    verificationCode: String
    activityDate: String
    activityRequest: String
    wishlistDate: String
    wishlistRef: String
    wishlistPurchased: Boolean
    cartItemDateAdded: String
    cartItemRef: String
    paymentInfoDate: String
    paymentInfoType: String
    paymentInfoDescription: String
    paymentInfoBody: String
    paymentInfoValid: Boolean
    paymentInfoPrimary: Boolean
  }

  type AuthData {
    activityId: ID!
    role: String!
    token: String
    tokenExpiration: Int!
    error: String
  }
  type TestMail {
    test: String
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

  }

  type RootMutation {

    createUser(userInput: UserInput!): User

  }

  schema {
      query: RootQuery
      mutation: RootMutation
  }
`);
