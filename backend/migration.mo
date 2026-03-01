import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  // Define the old types
  type OldPost = {
    id : Text;
    author : Principal.Principal;
    caption : Text;
    photo : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    category : {
      #environmental;
      #communityService;
      #actsOfKindness;
      #other;
    };
    timestamp : Time.Time;
    likes : Nat;
    comments : Nat;
    isFlagged : Bool;
  };

  type OldActor = {
    posts : Map.Map<Text, OldPost>;
    // Add other old variables if needed
  };

  // Define the new types
  type NewPost = {
    id : Text;
    author : Principal.Principal;
    caption : Text;
    parentPostId : ?Text;
    photo : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    category : {
      #environmental;
      #communityService;
      #actsOfKindness;
      #other;
    };
    timestamp : Time.Time;
    likes : Nat;
    comments : Nat;
    isFlagged : Bool;
  };

  type NewActor = {
    posts : Map.Map<Text, NewPost>;
    // Add other new variables if needed
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newPosts = old.posts.map<Text, OldPost, NewPost>(
      func(_id, oldPost) {
        { oldPost with parentPostId = null };
      }
    );

    {
      posts = newPosts;
      // Map other variables if needed
    };
  };
};
