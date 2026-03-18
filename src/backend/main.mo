import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";

import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  stable var adminPrincipal : Principal = Principal.fromText("kcznz-vfjcj-xmtzc-aw23m-th6f7-43fd3-ytu3i-ot3ig-nuwnj-oba6h-fqe");

  // Blob Storage
  include MixinStorage();

  // We can't call this in an actor field in the migration module
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // All known admin principals across environments
  let adminPrincipals : [Principal] = [
    Principal.fromText("kcznz-vfjcj-xmtzc-aw23m-th6f7-43fd3-ytu3i-ot3ig-nuwnj-oba6h-fqe"),
    Principal.fromText("d5t6k-adjdl-ak3tk-xi2mp-lpwl2-wx2mt-35n2k-xy7nd-l5kbv-cyb6v-mqe"),
    Principal.fromText("uorkh-nazas-r5n3p-kj44w-gwm4i-liaj3-jqjll-ws44w-7dlve-3mshw-sae"),
    Principal.fromText("3v75a-wjltj-sunb6-sasdr-dqqeh-ckksg-tchoh-dhopt-ufuqd-fiezq-kqe"),
  ];

  func isAdminPrincipal(p : Principal) : Bool {
    for (ap in adminPrincipals.vals()) {
      if (ap == p) return true;
    };
    false;
  };

  type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type Collection = {
    id : Text;
    name : Text;
    description : Text;
    coverImageId : ?Storage.ExternalBlob;
    createdAt : Int;
  };

  module Collection {
    public func compare(collection1 : Collection, collection2 : Collection) : Order.Order {
      switch (Text.compare(collection1.id, collection2.id)) {
        case (#equal) { Text.compare(collection1.id, collection2.id) };
        case (order) { order };
      };
    };
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

  module NFT {
    public func compare(nft1 : NFT, nft2 : NFT) : Order.Order {
      switch (Text.compare(nft1.id, nft2.id)) {
        case (#equal) { Text.compare(nft1.id, nft2.id) };
        case (order) { order };
      };
    };
  };

  stable var collections : Map.Map<Text, Collection> = Map.empty<Text, Collection>();
  stable var nfts : Map.Map<Text, NFT> = Map.empty<Text, NFT>();
  // NFT ownership: maps NFT id -> owner principal text; absent = held by gallery/admin
  stable var nftOwners : Map.Map<Text, Text> = Map.empty<Text, Text>();
  // Newsletter subscribers: email -> subscribed timestamp
  stable var subscribers : Map.Map<Text, Int> = Map.empty<Text, Int>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminPrincipal(caller)) {
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
    if (not isAdminPrincipal(caller)) {
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
    if (not isAdminPrincipal(caller)) {
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
    if (not isAdminPrincipal(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not collections.containsKey(id)) {
      Runtime.trap("Collection not found");
    };

    collections.remove(id);

    // OptioNally, remove NFTs belonging to this collection
    let toRemove = nfts.values().filter(func(nft) { nft.collectionId == id }).toArray();
    toRemove.values().forEach(func(nft) { nfts.remove(nft.id) });
  };

  // NFT Management (Admin-only)
  public shared ({ caller }) func mintNFT(id : Text, title : Text, description : Text, imageId : Storage.ExternalBlob, collectionId : Text, edition : Text) : async () {
    if (not isAdminPrincipal(caller)) {
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
    if (not isAdminPrincipal(caller)) {
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
    if (not isAdminPrincipal(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not nfts.containsKey(id)) {
      Runtime.trap("NFT not found");
    };

    nfts.remove(id);
  };

  // NFT Transfer (Admin-only): transfer ownership to a principal text
  public shared ({ caller }) func transferNFT(nftId : Text, toOwner : Text) : async () {
    if (not isAdminPrincipal(caller)) {
      Runtime.trap("Unauthorized: Only admins can transfer NFTs");
    };
    if (not nfts.containsKey(nftId)) {
      Runtime.trap("NFT not found");
    };
    // Validate principal text is parseable
    let _ = Principal.fromText(toOwner);
    nftOwners.add(nftId, toOwner);
  };

  // Get current owner of an NFT (null = held by gallery)
  public query func getNFTOwner(nftId : Text) : async ?Text {
    nftOwners.get(nftId);
  };

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

  public query ({ caller }) func isAdmin() : async Bool {
    isAdminPrincipal(caller);
  };

  // Newsletter Subscriber Management
  public shared func subscribeEmail(email : Text) : async Text {
    let trimmed = email.trim(#char ' ');
    if (trimmed.size() == 0) {
      Runtime.trap("E-Mail darf nicht leer sein");
    };
    if (subscribers.containsKey(trimmed)) {
      return "already_subscribed";
    };
    subscribers.add(trimmed, Time.now());
    return "subscribed";
  };

  public query ({ caller }) func getSubscribers() : async [Text] {
    if (not isAdminPrincipal(caller)) {
      Runtime.trap("Unauthorized: Only admins can view subscribers");
    };
    subscribers.keys().toArray();
  };

  public shared ({ caller }) func deleteSubscriber(email : Text) : async () {
    if (not isAdminPrincipal(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete subscribers");
    };
    subscribers.remove(email);
  };
};
