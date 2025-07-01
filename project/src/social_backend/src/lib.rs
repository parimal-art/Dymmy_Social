use candid::{CandidType, Principal};
use ic_cdk::api::time;
use ic_cdk::{caller, id, query, update};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::cell::RefCell;

// Data Structures
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct UserProfile {
    pub id: Principal,
    pub username: String,
    pub name: String,
    pub bio: String,
    pub profile_photo: Option<Vec<u8>>,
    pub cover_photo: Option<Vec<u8>>,
    pub followers_count: u32,
    pub following_count: u32,
    pub posts_count: u32,
    pub created_at: i64,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Post {
    pub id: String,
    pub author: Principal,
    pub content: String,
    pub media: Option<Vec<u8>>,
    pub media_type: Option<String>,
    pub likes_count: u32,
    pub comments_count: u32,
    pub shares_count: u32,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Comment {
    pub id: String,
    pub post_id: String,
    pub author: Principal,
    pub content: String,
    pub likes_count: u32,
    pub created_at: i64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CreatePostRequest {
    pub content: String,
    pub media: Option<Vec<u8>>,
    pub media_type: Option<String>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub name: Option<String>,
    pub bio: Option<String>,
    pub profile_photo: Option<Vec<u8>>,
    pub cover_photo: Option<Vec<u8>>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CreateCommentRequest {
    pub post_id: String,
    pub content: String,
}

// Global State
thread_local! {
    static USERS: RefCell<HashMap<Principal, UserProfile>> = RefCell::new(HashMap::new());
    static POSTS: RefCell<HashMap<String, Post>> = RefCell::new(HashMap::new());
    static COMMENTS: RefCell<HashMap<String, Comment>> = RefCell::new(HashMap::new());
    static FOLLOWERS: RefCell<HashMap<Principal, HashSet<Principal>>> = RefCell::new(HashMap::new());
    static FOLLOWING: RefCell<HashMap<Principal, HashSet<Principal>>> = RefCell::new(HashMap::new());
    static POST_LIKES: RefCell<HashMap<String, HashSet<Principal>>> = RefCell::new(HashMap::new());
    static COMMENT_LIKES: RefCell<HashMap<String, HashSet<Principal>>> = RefCell::new(HashMap::new());
    static USER_POSTS: RefCell<HashMap<Principal, Vec<String>>> = RefCell::new(HashMap::new());
    static POST_COMMENTS: RefCell<HashMap<String, Vec<String>>> = RefCell::new(HashMap::new());
}

// Utility Functions
fn generate_id(prefix: &str) -> String {
    format!("{}_{}", prefix, time())
}

// Authentication
#[query]
fn get_current_user() -> Option<UserProfile> {
    let caller = caller();
    if caller == Principal::anonymous() {
        None
    } else {
        USERS.with(|users| users.borrow().get(&caller).cloned())
    }
}

// Profile Management
#[update]
fn create_profile(req: UpdateProfileRequest) -> UserProfile {
    let caller = caller();
    let now = time() as i64;
    
    let profile = UserProfile {
        id: caller,
        username: req.username.unwrap_or_else(|| format!("user_{}", caller.to_text()[..8].to_string())),
        name: req.name.unwrap_or_else(|| "Anonymous User".to_string()),
        bio: req.bio.unwrap_or_else(|| "".to_string()),
        profile_photo: req.profile_photo,
        cover_photo: req.cover_photo,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: now,
    };
    
    USERS.with(|users| {
        users.borrow_mut().insert(caller, profile.clone());
    });
    
    profile
}

#[update]
fn update_profile(req: UpdateProfileRequest) -> UserProfile {
    let caller = caller();
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(mut profile) = users.get(&caller).cloned() {
            if let Some(username) = req.username {
                profile.username = username;
            }
            if let Some(name) = req.name {
                profile.name = name;
            }
            if let Some(bio) = req.bio {
                profile.bio = bio;
            }
            if let Some(photo) = req.profile_photo {
                profile.profile_photo = Some(photo);
            }
            if let Some(cover) = req.cover_photo {
                profile.cover_photo = Some(cover);
            }
            
            users.insert(caller, profile.clone());
            profile
        } else {
            panic!("Profile not found")
        }
    })
}

#[query]
fn get_profile(user_id: Principal) -> Option<UserProfile> {
    USERS.with(|users| users.borrow().get(&user_id).cloned())
}

#[query]
fn search_users(query: String) -> Vec<UserProfile> {
    let query_lower = query.to_lowercase();
    USERS.with(|users| {
        users
            .borrow()
            .values()
            .filter(|user| {
                user.username.to_lowercase().contains(&query_lower) ||
                user.name.to_lowercase().contains(&query_lower)
            })
            .cloned()
            .collect()
    })
}

#[query]
fn get_all_users() -> Vec<UserProfile> {
    USERS.with(|users| users.borrow().values().cloned().collect())
}

// Follow System
#[update]
fn follow_user(target_user: Principal) -> bool {
    let caller = caller();
    if caller == target_user {
        return false;
    }
    
    FOLLOWING.with(|following| {
        following.borrow_mut()
            .entry(caller)
            .or_insert_with(HashSet::new)
            .insert(target_user)
    });
    
    FOLLOWERS.with(|followers| {
        followers.borrow_mut()
            .entry(target_user)
            .or_insert_with(HashSet::new)
            .insert(caller)
    });
    
    // Update counts
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(mut caller_profile) = users.get(&caller).cloned() {
            caller_profile.following_count += 1;
            users.insert(caller, caller_profile);
        }
        if let Some(mut target_profile) = users.get(&target_user).cloned() {
            target_profile.followers_count += 1;
            users.insert(target_user, target_profile);
        }
    });
    
    true
}

#[update]
fn unfollow_user(target_user: Principal) -> bool {
    let caller = caller();
    
    let removed_following = FOLLOWING.with(|following| {
        following.borrow_mut()
            .entry(caller)
            .or_insert_with(HashSet::new)
            .remove(&target_user)
    });
    
    let removed_follower = FOLLOWERS.with(|followers| {
        followers.borrow_mut()
            .entry(target_user)
            .or_insert_with(HashSet::new)
            .remove(&caller)
    });
    
    if removed_following && removed_follower {
        // Update counts
        USERS.with(|users| {
            let mut users = users.borrow_mut();
            if let Some(mut caller_profile) = users.get(&caller).cloned() {
                caller_profile.following_count = caller_profile.following_count.saturating_sub(1);
                users.insert(caller, caller_profile);
            }
            if let Some(mut target_profile) = users.get(&target_user).cloned() {
                target_profile.followers_count = target_profile.followers_count.saturating_sub(1);
                users.insert(target_user, target_profile);
            }
        });
        true
    } else {
        false
    }
}

#[query]
fn is_following(target_user: Principal) -> bool {
    let caller = caller();
    FOLLOWING.with(|following| {
        following
            .borrow()
            .get(&caller)
            .map_or(false, |set| set.contains(&target_user))
    })
}

#[query]
fn get_followers(user_id: Principal) -> Vec<Principal> {
    FOLLOWERS.with(|followers| {
        followers
            .borrow()
            .get(&user_id)
            .map_or(Vec::new(), |set| set.iter().cloned().collect())
    })
}

#[query]
fn get_following(user_id: Principal) -> Vec<Principal> {
    FOLLOWING.with(|following| {
        following
            .borrow()
            .get(&user_id)
            .map_or(Vec::new(), |set| set.iter().cloned().collect())
    })
}

// Posts
#[update]
fn create_post(req: CreatePostRequest) -> Post {
    let caller = caller();
    let now = time() as i64;
    let post_id = generate_id("post");
    
    let post = Post {
        id: post_id.clone(),
        author: caller,
        content: req.content,
        media: req.media,
        media_type: req.media_type,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        created_at: now,
        updated_at: now,
    };
    
    POSTS.with(|posts| {
        posts.borrow_mut().insert(post_id.clone(), post.clone());
    });
    
    USER_POSTS.with(|user_posts| {
        user_posts.borrow_mut()
            .entry(caller)
            .or_insert_with(Vec::new)
            .push(post_id);
    });
    
    // Update user posts count
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(mut profile) = users.get(&caller).cloned() {
            profile.posts_count += 1;
            users.insert(caller, profile);
        }
    });
    
    post
}

#[query]
fn get_post(post_id: String) -> Option<Post> {
    POSTS.with(|posts| posts.borrow().get(&post_id).cloned())
}

#[query]
fn get_user_posts(user_id: Principal) -> Vec<Post> {
    USER_POSTS.with(|user_posts| {
        POSTS.with(|posts| {
            user_posts
                .borrow()
                .get(&user_id)
                .map_or(Vec::new(), |post_ids| {
                    post_ids
                        .iter()
                        .filter_map(|id| posts.borrow().get(id).cloned())
                        .collect()
                })
        })
    })
}

#[query]
fn get_feed() -> Vec<Post> {
    let caller = caller();
    
    // Get posts from users the caller is following
    let following_users = FOLLOWING.with(|following| {
        following
            .borrow()
            .get(&caller)
            .map_or(Vec::new(), |set| set.iter().cloned().collect())
    });
    
    let mut feed_posts = Vec::new();
    
    // Add caller's own posts
    let caller_posts = get_user_posts(caller);
    feed_posts.extend(caller_posts);
    
    // Add posts from followed users
    for user in following_users {
        let user_posts = get_user_posts(user);
        feed_posts.extend(user_posts);
    }
    
    // Sort by creation time (newest first)
    feed_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    
    feed_posts
}

#[update]
fn delete_post(post_id: String) -> bool {
    let caller = caller();
    
    POSTS.with(|posts| {
        let mut posts = posts.borrow_mut();
        if let Some(post) = posts.get(&post_id) {
            if post.author == caller {
                posts.remove(&post_id);
                
                // Remove from user posts
                USER_POSTS.with(|user_posts| {
                    if let Some(user_post_ids) = user_posts.borrow_mut().get_mut(&caller) {
                        user_post_ids.retain(|id| id != &post_id);
                    }
                });
                
                // Update user posts count
                USERS.with(|users| {
                    let mut users = users.borrow_mut();
                    if let Some(mut profile) = users.get(&caller).cloned() {
                        profile.posts_count = profile.posts_count.saturating_sub(1);
                        users.insert(caller, profile);
                    }
                });
                
                true
            } else {
                false
            }
        } else {
            false
        }
    })
}

// Post Interactions
#[update]
fn like_post(post_id: String) -> bool {
    let caller = caller();
    
    let liked = POST_LIKES.with(|post_likes| {
        post_likes.borrow_mut()
            .entry(post_id.clone())
            .or_insert_with(HashSet::new)
            .insert(caller)
    });
    
    if liked {
        POSTS.with(|posts| {
            let mut posts = posts.borrow_mut();
            if let Some(mut post) = posts.get(&post_id).cloned() {
                post.likes_count += 1;
                posts.insert(post_id, post);
            }
        });
    }
    
    liked
}

#[update]
fn unlike_post(post_id: String) -> bool {
    let caller = caller();
    
    let unliked = POST_LIKES.with(|post_likes| {
        post_likes.borrow_mut()
            .entry(post_id.clone())
            .or_insert_with(HashSet::new)
            .remove(&caller)
    });
    
    if unliked {
        POSTS.with(|posts| {
            let mut posts = posts.borrow_mut();
            if let Some(mut post) = posts.get(&post_id).cloned() {
                post.likes_count = post.likes_count.saturating_sub(1);
                posts.insert(post_id, post);
            }
        });
    }
    
    unliked
}

#[query]
fn is_post_liked(post_id: String) -> bool {
    let caller = caller();
    POST_LIKES.with(|post_likes| {
        post_likes
            .borrow()
            .get(&post_id)
            .map_or(false, |set| set.contains(&caller))
    })
}

#[update]
fn share_post(original_post_id: String) -> Post {
    let caller = caller();
    let now = time() as i64;
    let post_id = generate_id("shared_post");
    
    // Get original post
    let original_post = POSTS.with(|posts| {
        posts.borrow().get(&original_post_id).cloned()
    });
    
    if let Some(original) = original_post {
        let shared_post = Post {
            id: post_id.clone(),
            author: caller,
            content: format!("Shared: {}", original.content),
            media: original.media,
            media_type: original.media_type,
            likes_count: 0,
            comments_count: 0,
            shares_count: 0,
            created_at: now,
            updated_at: now,
        };
        
        POSTS.with(|posts| {
            posts.borrow_mut().insert(post_id.clone(), shared_post.clone());
        });
        
        USER_POSTS.with(|user_posts| {
            user_posts.borrow_mut()
                .entry(caller)
                .or_insert_with(Vec::new)
                .push(post_id);
        });
        
        // Update original post shares count
        POSTS.with(|posts| {
            let mut posts = posts.borrow_mut();
            if let Some(mut original_post) = posts.get(&original_post_id).cloned() {
                original_post.shares_count += 1;
                posts.insert(original_post_id, original_post);
            }
        });
        
        // Update user posts count
        USERS.with(|users| {
            let mut users = users.borrow_mut();
            if let Some(mut profile) = users.get(&caller).cloned() {
                profile.posts_count += 1;
                users.insert(caller, profile);
            }
        });
        
        shared_post
    } else {
        panic!("Original post not found")
    }
}

// Comments
#[update]
fn create_comment(req: CreateCommentRequest) -> Comment {
    let caller = caller();
    let now = time() as i64;
    let comment_id = generate_id("comment");
    
    let comment = Comment {
        id: comment_id.clone(),
        post_id: req.post_id.clone(),
        author: caller,
        content: req.content,
        likes_count: 0,
        created_at: now,
    };
    
    COMMENTS.with(|comments| {
        comments.borrow_mut().insert(comment_id.clone(), comment.clone());
    });
    
    POST_COMMENTS.with(|post_comments| {
        post_comments.borrow_mut()
            .entry(req.post_id.clone())
            .or_insert_with(Vec::new)
            .push(comment_id);
    });
    
    // Update post comments count
    POSTS.with(|posts| {
        let mut posts = posts.borrow_mut();
        if let Some(mut post) = posts.get(&req.post_id).cloned() {
            post.comments_count += 1;
            posts.insert(req.post_id, post);
        }
    });
    
    comment
}

#[query]
fn get_post_comments(post_id: String) -> Vec<Comment> {
    POST_COMMENTS.with(|post_comments| {
        COMMENTS.with(|comments| {
            post_comments
                .borrow()
                .get(&post_id)
                .map_or(Vec::new(), |comment_ids| {
                    comment_ids
                        .iter()
                        .filter_map(|id| comments.borrow().get(id).cloned())
                        .collect()
                })
        })
    })
}

#[update]
fn like_comment(comment_id: String) -> bool {
    let caller = caller();
    
    let liked = COMMENT_LIKES.with(|comment_likes| {
        comment_likes.borrow_mut()
            .entry(comment_id.clone())
            .or_insert_with(HashSet::new)
            .insert(caller)
    });
    
    if liked {
        COMMENTS.with(|comments| {
            let mut comments = comments.borrow_mut();
            if let Some(mut comment) = comments.get(&comment_id).cloned() {
                comment.likes_count += 1;
                comments.insert(comment_id, comment);
            }
        });
    }
    
    liked
}

#[update]
fn unlike_comment(comment_id: String) -> bool {
    let caller = caller();
    
    let unliked = COMMENT_LIKES.with(|comment_likes| {
        comment_likes.borrow_mut()
            .entry(comment_id.clone())
            .or_insert_with(HashSet::new)
            .remove(&caller)
    });
    
    if unliked {
        COMMENTS.with(|comments| {
            let mut comments = comments.borrow_mut();
            if let Some(mut comment) = comments.get(&comment_id).cloned() {
                comment.likes_count = comment.likes_count.saturating_sub(1);
                comments.insert(comment_id, comment);
            }
        });
    }
    
    unliked
}

#[update]
fn delete_comment(comment_id: String) -> bool {
    let caller = caller();
    
    COMMENTS.with(|comments| {
        let mut comments = comments.borrow_mut();
        if let Some(comment) = comments.get(&comment_id) {
            if comment.author == caller {
                let post_id = comment.post_id.clone();
                comments.remove(&comment_id);
                
                // Remove from post comments
                POST_COMMENTS.with(|post_comments| {
                    if let Some(comment_ids) = post_comments.borrow_mut().get_mut(&post_id) {
                        comment_ids.retain(|id| id != &comment_id);
                    }
                });
                
                // Update post comments count
                POSTS.with(|posts| {
                    let mut posts = posts.borrow_mut();
                    if let Some(mut post) = posts.get(&post_id).cloned() {
                        post.comments_count = post.comments_count.saturating_sub(1);
                        posts.insert(post_id, post);
                    }
                });
                
                true
            } else {
                false
            }
        } else {
            false
        }
    })
}