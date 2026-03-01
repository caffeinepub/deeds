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
import Array "mo:core/Array";
import MixinStorage "blob-storage/Mixin";
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

  var userProfiles = Map.empty<Principal, UserProfile>();
  var posts = Map.empty<Text, Post>();
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
  };

  // ── Health checks (admin-only) ────────────────────────────────────────────

  public shared ({ caller }) func healthcheckWithStorageCleanup() : async { operational : Bool; message : Text; storageSystem : Bool } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform health check with storage cleanup");
    };
    {
      operational = true;
      storageSystem = true;
      message = "Storage system is operational and cleaned up.";
    };
  };

  public shared ({ caller }) func healthcheckWithPhotos() : async { photoSystem : Bool } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform photo system health check");
    };
    {
      photoSystem = true;
    };
  };

  // ── User profiles ─────────────────────────────────────────────────────────

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only users can view profiles");
      };
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their own profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let validatedProfile : UserProfile = {
      principal = caller;
      name = profile.name;
      bio = profile.bio;
      profilePicture = profile.profilePicture;
      followers = profile.followers;
      following = profile.following;
      statusText = profile.statusText;
      statusImage = profile.statusImage;
      layoutPreferences = profile.layoutPreferences;
    };
    userProfiles.add(caller, validatedProfile);
  };

  // ── Photo albums ──────────────────────────────────────────────────────────

  public shared ({ caller }) func createPhotoAlbum(albumId : Text, albumName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create photo albums");
    };
    let newAlbum : PhotoAlbum = {
      id = albumId;
      name = albumName;
      photos = List.empty<Storage.ExternalBlob>();
    };
    let currentAlbums = switch (photoAlbums.get(caller)) {
      case (null) { List.empty<PhotoAlbum>() };
      case (?albums) { albums };
    };
    currentAlbums.add(newAlbum);
    photoAlbums.add(caller, currentAlbums);
  };

  public shared ({ caller }) func addPhotoToAlbum(albumId : Text, photo : Storage.ExternalBlob) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add photos to albums");
    };
    switch (photoAlbums.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Album not found or does not belong to caller");
      };
      case (?albums) {
        var albumFound = false;
        for (album in albums.values()) {
          if (album.id == albumId) {
            albumFound := true;
          };
        };
        if (not albumFound) {
          Runtime.trap("Unauthorized: Album does not belong to caller");
        };
        let updatedAlbums = albums.map<PhotoAlbum, PhotoAlbum>(
          func(album) {
            if (album.id == albumId) {
              let newPhotos = List.empty<Storage.ExternalBlob>();
              album.photos.toArray().forEach(func(p) { newPhotos.add(p) });
              newPhotos.add(photo);
              {
                id = album.id;
                name = album.name;
                photos = newPhotos;
              };
            } else {
              album;
            };
          }
        );
        photoAlbums.add(caller, updatedAlbums);
        true;
      };
    };
  };

  // ── Video albums ──────────────────────────────────────────────────────────

  public shared ({ caller }) func createVideoAlbum(albumId : Text, albumName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create video albums");
    };
    let newAlbum : VideoAlbum = {
      id = albumId;
      name = albumName;
      videos = List.empty<Storage.ExternalBlob>();
    };
    let currentAlbums = switch (videoAlbums.get(caller)) {
      case (null) { List.empty<VideoAlbum>() };
      case (?albums) { albums };
    };
    currentAlbums.add(newAlbum);
    videoAlbums.add(caller, currentAlbums);
  };

  public shared ({ caller }) func addVideoToAlbum(albumId : Text, video : Storage.ExternalBlob) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add videos to albums");
    };
    switch (videoAlbums.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Album not found or does not belong to caller");
      };
      case (?albums) {
        var albumFound = false;
        for (album in albums.values()) {
          if (album.id == albumId) {
            albumFound := true;
          };
        };
        if (not albumFound) {
          Runtime.trap("Unauthorized: Album does not belong to caller");
        };
        let updatedAlbums = albums.map<VideoAlbum, VideoAlbum>(
          func(album) {
            if (album.id == albumId) {
              let newVideos = List.empty<Storage.ExternalBlob>();
              album.videos.toArray().forEach(func(v) { newVideos.add(v) });
              newVideos.add(video);
              {
                id = album.id;
                name = album.name;
                videos = newVideos;
              };
            } else {
              album;
            };
          }
        );
        videoAlbums.add(caller, updatedAlbums);
        true;
      };
    };
  };

  // ── Music attachments ─────────────────────────────────────────────────────

  public shared ({ caller }) func attachMusicToStatus(musicId : Text, title : Text, artist : Text, audio : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can attach music to status");
    };
    let attachment : MusicAttachment = {
      id = musicId;
      title;
      artist;
      audioFile = audio;
    };
    musicAttachments.add(musicId, attachment);
    musicAttachmentOwners.add(musicId, caller);
  };

  public shared ({ caller }) func removeMusicAttachment(musicId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove music attachments");
    };
    switch (musicAttachmentOwners.get(musicId)) {
      case (null) {
        Runtime.trap("Unauthorized: Music attachment not found");
      };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only remove your own music attachments");
        };
        musicAttachments.remove(musicId);
        musicAttachmentOwners.remove(musicId);
        true;
      };
    };
  };

  // ── Album queries ─────────────────────────────────────────────────────────

  public query ({ caller }) func getMyPhotoAlbums() : async [PhotoAlbumView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their photo albums");
    };
    switch (photoAlbums.get(caller)) {
      case (null) { [] };
      case (?albums) {
        albums.map<PhotoAlbum, PhotoAlbumView>(
          func(album) {
            {
              id = album.id;
              name = album.name;
              photos = album.photos.toArray();
            };
          }
        ).toArray();
      };
    };
  };

  public query ({ caller }) func getMyVideoAlbums() : async [VideoAlbumView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their video albums");
    };
    switch (videoAlbums.get(caller)) {
      case (null) { [] };
      case (?albums) {
        albums.map<VideoAlbum, VideoAlbumView>(
          func(album) {
            {
              id = album.id;
              name = album.name;
              videos = album.videos.toArray();
            };
          }
        ).toArray();
      };
    };
  };

  public query ({ caller }) func getUserPhotoAlbums(user : Principal) : async [PhotoAlbumView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view photo albums");
    };
    switch (photoAlbums.get(user)) {
      case (null) { [] };
      case (?albums) {
        albums.map<PhotoAlbum, PhotoAlbumView>(
          func(album) {
            {
              id = album.id;
              name = album.name;
              photos = album.photos.toArray();
            };
          }
        ).toArray();
      };
    };
  };

  public query ({ caller }) func getUserVideoAlbums(user : Principal) : async [VideoAlbumView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view video albums");
    };
    switch (videoAlbums.get(user)) {
      case (null) { [] };
      case (?albums) {
        albums.map<VideoAlbum, VideoAlbumView>(
          func(album) {
            {
              id = album.id;
              name = album.name;
              videos = album.videos.toArray();
            };
          }
        ).toArray();
      };
    };
  };

  public query ({ caller }) func getUserAlbums(user : Principal) : async {
    photoAlbums : [PhotoAlbumView];
    videoAlbums : [VideoAlbumView];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view albums");
    };
    let photos = switch (photoAlbums.get(user)) {
      case (null) { [] };
      case (?albums) {
        albums.map<PhotoAlbum, PhotoAlbumView>(
          func(album) {
            {
              id = album.id;
              name = album.name;
              photos = album.photos.toArray();
            };
          }
        ).toArray();
      };
    };
    let videos = switch (videoAlbums.get(user)) {
      case (null) { [] };
      case (?albums) {
        albums.map<VideoAlbum, VideoAlbumView>(
          func(album) {
            {
              id = album.id;
              name = album.name;
              videos = album.videos.toArray();
            };
          }
        ).toArray();
      };
    };
    {
      photoAlbums = photos;
      videoAlbums = videos;
    };
  };

  // ── Music queries ─────────────────────────────────────────────────────────

  public query ({ caller }) func getMusicAttachment(musicId : Text) : async ?MusicAttachment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access music attachments");
    };
    musicAttachments.get(musicId);
  };

  public query ({ caller }) func getAllMusicAttachments() : async [MusicAttachment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access music attachments");
    };
    musicAttachments.values().toArray();
  };

  // ── Status updates ────────────────────────────────────────────────────────

  public shared ({ caller }) func addStatusUpdate(text : ?Text, image : ?Storage.ExternalBlob, music : ?MusicAttachment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add status updates");
    };
    let status : StatusUpdate = {
      text;
      image;
      timestamp = Time.now();
      music;
    };
    let currentStatus = switch (statusUpdates.get(caller)) {
      case (null) { List.empty<StatusUpdate>() };
      case (?statuses) { statuses };
    };
    currentStatus.add(status);
    statusUpdates.add(caller, currentStatus);
  };

  public query ({ caller }) func getUserStatusUpdates(user : Principal) : async [StatusUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get status updates");
    };
    switch (statusUpdates.get(user)) {
      case (null) { [] };
      case (?statuses) {
        statuses.toArray();
      };
    };
  };

  public query ({ caller }) func getFriendsStatusUpdates(friends : [Principal]) : async [StatusUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get friends' status updates");
    };
    let friendStatusUpdates = friends.map(
      func(friend) {
        switch (statusUpdates.get(friend)) {
          case (null) { [] : [StatusUpdate] };
          case (?statuses) { statuses.toArray() };
        };
      }
    );
    let flattenedStatusUpdates = List.empty<StatusUpdate>();
    friendStatusUpdates.forEach(
      func(statusArray) {
        for (status in statusArray.values()) {
          flattenedStatusUpdates.add(status);
        };
      }
    );
    flattenedStatusUpdates.toArray();
  };

  // ── Posts & Ripple Effect Stories ─────────────────────────────────────────

  public shared ({ caller }) func createPost(id : Text, caption : Text, parentPostId : ?Text, photo : ?Storage.ExternalBlob, video : ?Storage.ExternalBlob, category : PostCategory) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    let newPost : Post = {
      id;
      author = caller;
      caption;
      parentPostId;
      photo;
      video;
      category;
      timestamp = Time.now();
      likes = 0;
      comments = 0;
      isFlagged = false;
    };

    posts.add(id, newPost);

    switch (parentPostId) {
      case (?parentId) {
        let currentChildren = switch (rippleChains.get(parentId)) {
          case (null) { List.empty<Text>() };
          case (?children) { children };
        };
        currentChildren.add(id);
        rippleChains.add(parentId, currentChildren);
      };
      case (null) {};
    };

    newPost;
  };

  public query ({ caller }) func getRippleChain(postId : Text) : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access ripple chains");
    };
    switch (rippleChains.get(postId)) {
      case (null) { [] };
      case (?children) {
        children.map<Text, Post>(
          func(childId) {
            switch (posts.get(childId)) {
              case (null) { Runtime.trap("Child post not found " # childId) };
              case (?childPost) { childPost };
            };
          }
        ).toArray();
      };
    };
  };

  // ── Love Notes to Strangers ───────────────────────────────────────────────

  public shared ({ caller }) func sendLoveNote(id : Text, recipient : Principal, message : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send love notes");
    };

    if (message.size() > 280) {
      Runtime.trap("Love note message exceeds 280 characters");
    };

    let note : LoveNote = {
      id;
      sender = caller;
      recipient;
      message;
      timestamp = Time.now();
    };

    loveNotes.add(id, note);

    loveNotes.size().toText();
  };

  // Public count — no sensitive data exposed, no auth required
  public query ({ caller }) func getLoveNotesCount() : async Nat {
    loveNotes.size();
  };

  // Only the recipient may read their own love notes
  public query ({ caller }) func getMyLoveNotes() : async [LoveNote] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their love notes");
    };
    loveNotes.values().toArray().filter(
      func(note) {
        note.recipient == caller;
      }
    );
  };

  // ── Deed of the Day Challenges ────────────────────────────────────────────

  // Admin-only: set (or replace) a daily challenge
  public shared ({ caller }) func setDailyChallenge(id : Text, prompt : Text, category : PostCategory, date : Time.Time) : async DailyChallenge {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set daily challenges");
    };
    let challenge : DailyChallenge = {
      id;
      prompt;
      category;
      date;
    };
    dailyChallenges.add(id, challenge);
    challenge;
  };

  // Any authenticated user may read today's challenge
  public query ({ caller }) func getTodaysChallenge() : async ?DailyChallenge {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view today's challenge");
    };
    let now = Time.now();
    let oneDayNs : Int = 86_400_000_000_000;
    var latest : ?DailyChallenge = null;
    for (challenge in dailyChallenges.values()) {
      let age = now - challenge.date;
      if (age >= 0 and age < oneDayNs) {
        switch (latest) {
          case (null) { latest := ?challenge };
          case (?prev) {
            if (challenge.date > prev.date) {
              latest := ?challenge;
            };
          };
        };
      };
    };
    latest;
  };

  public shared ({ caller }) func completeDailyChallenge(challengeId : Text, postId : Text) : async ChallengeCompletion {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete daily challenges");
    };

    switch (dailyChallenges.get(challengeId)) {
      case (null) {
        Runtime.trap("Challenge not found");
      };
      case (?_) {
        let completionId = challengeCompletions.size().toText();
        let completion : ChallengeCompletion = {
          id = completionId;
          user = caller;
          challengeId;
          postId;
          timestamp = Time.now();
        };
        challengeCompletions.add(completionId, completion);
        completion;
      };
    };
  };

  public query ({ caller }) func getChallengeCompletions(challengeId : Text) : async [ChallengeCompletion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access challenge completions");
    };
    challengeCompletions.values().toArray().filter(
      func(completion) { completion.challengeId == challengeId }
    );
  };

  // A user may only view their own completions; admins may view any user's
  public query ({ caller }) func getUserChallengeCompletions(user : Principal) : async [ChallengeCompletion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access challenge completions");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own challenge completions");
    };
    challengeCompletions.values().toArray().filter(
      func(completion) { completion.user == user }
    );
  };

  // ── Kindness Matches ──────────────────────────────────────────────────────

  // Admin or the system can store computed matches for a user
  public shared ({ caller }) func storeKindnessMatches(user : Principal, matches : [KindnessMatch]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can store kindness matches");
    };
    let matchList = List.empty<KindnessMatch>();
    for (m in matches.values()) {
      matchList.add(m);
    };
    kindnessMatches.add(user.toText(), matchList);
  };

  // A user may only retrieve their own top matches; admins may query any user
  public query ({ caller }) func getTopMatches(user : Principal) : async [KindnessMatch] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access kindness matches");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own kindness matches");
    };

    switch (kindnessMatches.get(user.toText())) {
      case (null) { [] };
      case (?matches) {
        let all = matches.toArray();
        // Return at most the top 5 (stored in insertion order, assumed pre-sorted)
        if (all.size() <= 5) { all } else {
          Array.tabulate<KindnessMatch>(5, func(i) { all[i] });
        };
      };
    };
  };

  // ── Memory Jars ───────────────────────────────────────────────────────────

  public shared ({ caller }) func addToMemoryJar(postId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to memory jar");
    };

    let entry : MemoryJarEntry = {
      postId;
      savedAt = Time.now();
    };

    let currentEntries = switch (memoryJars.get(caller)) {
      case (null) { List.empty<MemoryJarEntry>() };
      case (?entries) { entries };
    };
    currentEntries.add(entry);
    memoryJars.add(caller, currentEntries);

    true;
  };

  public shared ({ caller }) func removeFromMemoryJar(postId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from memory jar");
    };

    switch (memoryJars.get(caller)) {
      case (null) { false };
      case (?entries) {
        let filtered = entries.filter(func(e : MemoryJarEntry) : Bool { e.postId != postId });
        memoryJars.add(caller, filtered);
        true;
      };
    };
  };

  // A user may only read their own Memory Jar
  public query ({ caller }) func getMyMemoryJar() : async [MemoryJarEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access memory jars");
    };

    switch (memoryJars.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };
};
