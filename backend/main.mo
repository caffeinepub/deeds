import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinStorage "blob-storage/Mixin";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  let storage = Storage.new();
  include MixinStorage(storage);

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // ─── State ───────────────────────────────────────────────────────────────────

  var userProfiles = Map.empty<Principal, UserProfile>();
  var posts = Map.empty<Text, Post>();
  var postsArchived = List.empty<ArchivedPost>();
  var comments = Map.empty<Text, Comment>();
  var likes = Map.empty<Text, Like>();
  var follows = Map.empty<Text, Follow>();
  var messages = Map.empty<Text, Message>();
  var notifications = Map.empty<Text, Notification>();
  var liveSessions = Map.empty<Text, LiveSession>();
  var liveComments = Map.empty<Text, LiveComment>();
  var sessionTracking = Map.empty<Text, SessionTracking>();
  var blogs = Map.empty<Text, Blog>();
  var marketplacePosts = Map.empty<Text, MarketplacePost>();
  var savedMarketplacePosts = Map.empty<Principal, List.List<Text>>();
  var photoAlbums = Map.empty<Principal, List.List<PhotoAlbum>>();
  var videoAlbums = Map.empty<Principal, List.List<VideoAlbum>>();
  var musicAttachments = Map.empty<Text, MusicAttachment>();
  var musicAttachmentOwners = Map.empty<Text, Principal>();
  var statusUpdates = Map.empty<Principal, List.List<StatusUpdate>>();
  var achievements = Map.empty<Principal, List.List<Achievement>>();
  var rippleChains = Map.empty<Text, List.List<Text>>();
  var loveNotes = Map.empty<Text, LoveNote>();
  var dailyChallenges = Map.empty<Text, DailyChallenge>();
  var challengeCompletions = Map.empty<Text, ChallengeCompletion>();
  var kindnessMatches = Map.empty<Text, List.List<KindnessMatch>>();
  var memoryJars = Map.empty<Principal, List.List<MemoryJarEntry>>();
  var profileReportCards = Map.empty<Principal, ProfileReportCard>();

  // ─── Types ───────────────────────────────────────────────────────────────────

  type UserProfile = {
    principal : Principal;
    name : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
    followers : Nat;
    following : Nat;
    statusText : ?Text;
    statusImage : ?Storage.ExternalBlob;
    layoutPreferences : ?Text;
  };

  type PostCategory = {
    #environmental;
    #communityService;
    #actsOfKindness;
    #other;
  };

  type Post = {
    id : Text;
    author : Principal;
    caption : Text;
    parentPostId : ?Text;
    photo : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    category : PostCategory;
    timestamp : Time.Time;
    likes : Nat;
    comments : Nat;
    isFlagged : Bool;
  };

  type ArchivedPost = {
    post : Post;
    archivedAt : Time.Time;
  };

  type GradingScale = {
    #letterGrade; // A-F
    #starRating; // 1-5
    #percentage; // 0-100
  };

  type ProfileReportCard = {
    postsCount : Nat;
    deedsCompleted : Nat;
    likesReceived : Nat;
    weekStart : Time.Time;
    gradingScale : GradingScale;
    isPublic : Bool;
    scores : [Score];
    grade : ?Grade;
  };

  type Score = {
    value : Nat32;
    timestamp : Time.Time;
  };

  type Grade = {
    value : Nat32;
    timestamp : Time.Time;
  };

  type Comment = {
    id : Text;
    postId : Text;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Like = {
    postId : Text;
    user : Principal;
  };

  type Follow = {
    follower : Principal;
    following : Principal;
  };

  type Message = {
    id : Text;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Notification = {
    id : Text;
    user : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  type LiveSession = {
    id : Text;
    broadcaster : Principal;
    streamId : Text;
    timestamp : Time.Time;
    viewers : Nat;
    isActive : Bool;
  };

  type LiveComment = {
    id : Text;
    sessionId : Text;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type SessionTracking = {
    user : Principal;
    sessionStart : Time.Time;
    sessionDuration : Nat;
    dailyUsage : Nat;
    lastActive : Time.Time;
  };

  type Blog = {
    id : Text;
    author : Principal;
    title : Text;
    content : Text;
    media : [Storage.ExternalBlob];
    categories : [Text];
    tags : [Text];
    timestamp : Time.Time;
    isLive : Bool;
    likes : Nat;
    comments : Nat;
  };

  type MarketplaceCategory = {
    #environment;
    #education;
    #communitySupport;
    #animalWelfare;
    #emotionalSupport;
    #other;
  };

  type MarketplacePost = {
    id : Text;
    author : Principal;
    title : Text;
    category : MarketplaceCategory;
    description : Text;
    location : Text;
    contactMethod : Text;
    media : ?Storage.ExternalBlob;
    postType : { #need; #offer };
    timestamp : Time.Time;
    views : Nat;
    savedCount : Nat;
  };

  type MarketplaceMatch = {
    post : MarketplacePost;
    distance : Nat;
    categoryMatch : Bool;
  };

  type MarketplaceFilter = {
    #newest;
    #closest;
    #popular;
  };

  type PhotoAlbum = {
    id : Text;
    name : Text;
    photos : List.List<Storage.ExternalBlob>;
  };

  type PhotoAlbumView = {
    id : Text;
    name : Text;
    photos : [Storage.ExternalBlob];
  };

  type VideoAlbum = {
    id : Text;
    name : Text;
    videos : List.List<Storage.ExternalBlob>;
  };

  type VideoAlbumView = {
    id : Text;
    name : Text;
    videos : [Storage.ExternalBlob];
  };

  type MusicAttachment = {
    id : Text;
    title : Text;
    artist : Text;
    audioFile : Storage.ExternalBlob;
  };

  type StatusUpdate = {
    text : ?Text;
    image : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    music : ?MusicAttachment;
  };

  type BadgeType = {
    #goodDeedComplete;
    #challengeParticipation;
    #longTermFriendship;
    #contentCreator;
  };

  type Achievement = {
    id : Text;
    user : Principal;
    name : Text;
    description : Text;
    badgeType : BadgeType;
    icon : ?Storage.ExternalBlob;
    isUnlocked : Bool;
    unlockTimestamp : ?Time.Time;
  };

  type LoveNote = {
    id : Text;
    sender : Principal;
    recipient : Principal;
    message : Text;
    timestamp : Time.Time;
  };

  type DailyChallenge = {
    id : Text;
    prompt : Text;
    category : PostCategory;
    date : Time.Time;
  };

  type ChallengeCompletion = {
    id : Text;
    user : Principal;
    challengeId : Text;
    postId : Text;
    timestamp : Time.Time;
  };

  type KindnessMatch = {
    withUser : Principal;
    sharedCategories : [PostCategory];
    compatibilityScore : Nat;
    reason : Text;
  };

  type MemoryJarEntry = {
    postId : Text;
    savedAt : Time.Time;
    isPublic : Bool;
  };

  // ─── Helper ──────────────────────────────────────────────────────────────────

  func generateId(prefix : Text, caller : Principal) : Text {
    prefix # caller.toText() # Int.abs(Time.now()).toText();
  };

  // TODO [Implementation Changed - Rest unchanged]
};
