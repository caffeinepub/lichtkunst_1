import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  // Admin principal
  let adminPrincipal = Principal.fromText("uorkh-nazas-r5n3p-kj44w-gwm4i-liaj3-jqjll-ws44w-7dlve-3mshw-sae");
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Blob Storage
  include MixinStorage();

  // Helper: check if caller is admin (hardcoded principal OR role-based)
  private func checkIsAdmin(caller : Principal) : Bool {
    caller == adminPrincipal or AccessControl.isAdmin(accessControlState, caller);
  };

  // Explicit isAdmin check function
  public query ({ caller }) func isAdmin() : async Bool {
    checkIsAdmin(caller);
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Data Types
  type Collection = {
    id : Text;
    name : Text;
    description : Text;
    coverImageId : ?Storage.ExternalBlob;
    createdAt : Int;
  };

  type NFT = {
    id : Text;
    title : Text;
    description : Text;
    imageId : Storage.ExternalBlob;
    collectionId : Text;
    edition : Text;
    mintedAt : Int;
  };

  module Collection {
    public func compare(collection1 : Collection, collection2 : Collection) : Order.Order {
      switch (Text.compare(collection1.id, collection2.id)) {
        case (#equal) { Text.compare(collection1.id, collection2.id) };
        case (order) { order };
      };
    };
  };

  module NFT {
    public func compare(nft1 : NFT, nft2 : NFT) : Order.Order {
      switch (Text.compare(nft1.id, nft2.id)) {
        case (#equal) { Text.compare(nft1.id, nft2.id) };
        case (order) { order };
      };
    };
  };

  // Storage Structures
  let collections = Map.empty<Text, Collection>();
  let nfts = Map.empty<Text, NFT>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Collection Management (Admin-only)
  public shared ({ caller }) func createCollection(id : Text, name : Text, description : Text, coverImageId : ?Storage.ExternalBlob) : async () {
    if (not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let collection : Collection = {
      id;
      name;
      description;
      coverImageId;
      createdAt = Time.now();
    };
    collections.add(id, collection);
  };

  public shared ({ caller }) func updateCollection(id : Text, name : Text, description : Text, coverImageId : ?Storage.ExternalBlob) : async () {
    if (not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (collections.get(id)) {
      case (null) { Runtime.trap("Collection not found") };
      case (?existing) {
        let updated : Collection = {
          id = existing.id;
          name;
          description;
          coverImageId;
          createdAt = existing.createdAt;
        };
        collections.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCollection(id : Text) : async () {
    if (not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not collections.containsKey(id)) {
      Runtime.trap("Collection not found");
    };

    collections.remove(id);

    // Remove NFTs belonging to this collection
    let toRemove = nfts.values().filter(func(nft) { nft.collectionId == id }).toArray();
    toRemove.values().forEach(func(nft) { nfts.remove(nft.id) });
  };

  // NFT Management (Admin-only)
  public shared ({ caller }) func mintNFT(id : Text, title : Text, description : Text, imageId : Storage.ExternalBlob, collectionId : Text, edition : Text) : async () {
    if (not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not collections.containsKey(collectionId)) {
      Runtime.trap("Collection does not exist");
    };

    let nft : NFT = {
      id;
      title;
      description;
      imageId;
      collectionId;
      edition;
      mintedAt = Time.now();
    };
    nfts.add(id, nft);
  };

  public shared ({ caller }) func updateNFT(id : Text, title : Text, description : Text, imageId : Storage.ExternalBlob, edition : Text) : async () {
    if (not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (nfts.get(id)) {
      case (null) { Runtime.trap("NFT not found") };
      case (?existing) {
        let updated : NFT = {
          id = existing.id;
          title;
          description;
          imageId;
          collectionId = existing.collectionId;
          edition;
          mintedAt = existing.mintedAt;
        };
        nfts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func burnNFT(id : Text) : async () {
    if (not checkIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not nfts.containsKey(id)) {
      Runtime.trap("NFT not found");
    };

    nfts.remove(id);
  };

  // Public Queries
  public query ({ caller }) func getAllCollections() : async [Collection] {
    collections.values().toArray().sort();
  };

  public query ({ caller }) func getCollectionById(id : Text) : async Collection {
    switch (collections.get(id)) {
      case (null) { Runtime.trap("Collection not found") };
      case (?collection) { collection };
    };
  };

  public query ({ caller }) func getAllNFTs() : async [NFT] {
    nfts.values().toArray().sort();
  };

  public query ({ caller }) func getNFTsByCollection(collectionId : Text) : async [NFT] {
    nfts.values().toArray().filter(func(nft) { nft.collectionId == collectionId });
  };

  public query ({ caller }) func getNFTById(id : Text) : async NFT {
    switch (nfts.get(id)) {
      case (null) { Runtime.trap("NFT not found") };
      case (?nft) { nft };
    };
  };
};
