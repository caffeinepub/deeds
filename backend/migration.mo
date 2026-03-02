import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type Post = {
    id : Text;
    author : Principal.Principal;
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

  type PostCategory = {
    #environmental;
    #communityService;
    #actsOfKindness;
    #other;
  };

  type ArchivedPost = {
    post : Post;
    archivedAt : Time.Time;
  };

  type GradingScale = {
    #letterGrade;
    #starRating;
    #percentage;
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

  type OldMemoryJarEntry = {
    postId : Text;
    savedAt : Time.Time;
  };

  type OldActor = {
    memoryJars : Map.Map<Principal.Principal, List.List<OldMemoryJarEntry>>;
  };

  type NewMemoryJarEntry = {
    postId : Text;
    savedAt : Time.Time;
    isPublic : Bool;
  };

  type NewActor = {
    memoryJars : Map.Map<Principal.Principal, List.List<NewMemoryJarEntry>>;
    postsArchived : List.List<ArchivedPost>;
    profileReportCards : Map.Map<Principal.Principal, ProfileReportCard>;
  };

  public func run(old : OldActor) : NewActor {
    let newMemoryJars = old.memoryJars.map<Principal.Principal, List.List<OldMemoryJarEntry>, List.List<NewMemoryJarEntry>>(
      func(_principal, oldList) {
        oldList.map<OldMemoryJarEntry, NewMemoryJarEntry>(
          func(oldEntry) {
            { oldEntry with isPublic = false };
          }
        );
      }
    );

    {
      memoryJars = newMemoryJars;
      postsArchived = List.empty<ArchivedPost>();
      profileReportCards = Map.empty<Principal.Principal, ProfileReportCard>();
    };
  };
};
