export const idlFactory = ({ IDL }) => {
  const Principal = IDL.Principal;
  const UserProfile = IDL.Record({
    'id' : Principal,
    'bio' : IDL.Text,
    'username' : IDL.Text,
    'created_at' : IDL.Int,
    'name' : IDL.Text,
    'followers_count' : IDL.Nat32,
    'following_count' : IDL.Nat32,
    'posts_count' : IDL.Nat32,
    'profile_photo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'cover_photo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Post = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'created_at' : IDL.Int,
    'updated_at' : IDL.Int,
    'media' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'likes_count' : IDL.Nat32,
    'author' : Principal,
    'comments_count' : IDL.Nat32,
    'shares_count' : IDL.Nat32,
    'media_type' : IDL.Opt(IDL.Text),
  });
  const Comment = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'post_id' : IDL.Text,
    'created_at' : IDL.Int,
    'likes_count' : IDL.Nat32,
    'author' : Principal,
  });
  const CreatePostRequest = IDL.Record({
    'content' : IDL.Text,
    'media' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'media_type' : IDL.Opt(IDL.Text),
  });
  const UpdateProfileRequest = IDL.Record({
    'bio' : IDL.Opt(IDL.Text),
    'username' : IDL.Opt(IDL.Text),
    'name' : IDL.Opt(IDL.Text),
    'profile_photo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'cover_photo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const CreateCommentRequest = IDL.Record({
    'content' : IDL.Text,
    'post_id' : IDL.Text,
  });
  return IDL.Service({
    'create_comment' : IDL.Func([CreateCommentRequest], [Comment], []),
    'create_post' : IDL.Func([CreatePostRequest], [Post], []),
    'create_profile' : IDL.Func([UpdateProfileRequest], [UserProfile], []),
    'delete_comment' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'delete_post' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'follow_user' : IDL.Func([Principal], [IDL.Bool], []),
    'get_all_users' : IDL.Func([], [IDL.Vec(UserProfile)], ['query']),
    'get_current_user' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'get_feed' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'get_followers' : IDL.Func([Principal], [IDL.Vec(Principal)], ['query']),
    'get_following' : IDL.Func([Principal], [IDL.Vec(Principal)], ['query']),
    'get_post' : IDL.Func([IDL.Text], [IDL.Opt(Post)], ['query']),
    'get_post_comments' : IDL.Func([IDL.Text], [IDL.Vec(Comment)], ['query']),
    'get_profile' : IDL.Func([Principal], [IDL.Opt(UserProfile)], ['query']),
    'get_user_posts' : IDL.Func([Principal], [IDL.Vec(Post)], ['query']),
    'is_following' : IDL.Func([Principal], [IDL.Bool], ['query']),
    'is_post_liked' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'like_comment' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'like_post' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'search_users' : IDL.Func([IDL.Text], [IDL.Vec(UserProfile)], ['query']),
    'share_post' : IDL.Func([IDL.Text], [Post], []),
    'unfollow_user' : IDL.Func([Principal], [IDL.Bool], []),
    'unlike_comment' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'unlike_post' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'update_profile' : IDL.Func([UpdateProfileRequest], [UserProfile], []),
  });
};
export const init = ({ IDL }) => { return []; };