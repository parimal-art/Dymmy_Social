import React, { useState, useEffect } from 'react';
import { Edit3, Users, User, MessageCircle, Calendar, MapPin } from 'lucide-react';
import PostCard from './PostCard';

const UserProfile = ({ actor, currentUser, userId, onEditProfile }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id?.toString() === userId?.toString();

  useEffect(() => {
    loadProfile();
    loadUserPosts();
    if (!isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const userProfile = await actor.get_profile(userId);
      if (userProfile && userProfile.length > 0) {
        setProfile(userProfile[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserPosts = async () => {
    try {
      const userPosts = await actor.get_user_posts(userId);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const following = await actor.is_following(userId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await actor.unfollow_user(userId);
        setIsFollowing(false);
      } else {
        await actor.follow_user(userId);
        setIsFollowing(true);
      }
      
      // Reload profile to get updated follower count
      await loadProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString();
  };

  const renderProfilePhoto = () => {
    if (profile?.profile_photo && profile.profile_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(profile.profile_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Profile"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        backgroundColor: '#e4e6ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <User size={60} color="#65676b" />
      </div>
    );
  };

  const renderCoverPhoto = () => {
    if (profile?.cover_photo && profile.cover_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(profile.cover_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Cover"
          style={{
            width: '100%',
            height: '300px',
            objectFit: 'cover'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '100%',
        height: '300px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }} />
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e4e6ea',
          borderTop: '4px solid #1877F2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        border: '1px solid #dadde1'
      }}>
        <p style={{
          fontSize: '18px',
          color: '#65676b',
          margin: 0
        }}>
          Profile not found
        </p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px',
        border: '1px solid #dadde1',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Cover Photo */}
        <div style={{
          position: 'relative',
          height: '300px',
          overflow: 'hidden'
        }}>
          {renderCoverPhoto()}
        </div>

        {/* Profile Info */}
        <div style={{
          padding: '20px',
          position: 'relative'
        }}>
          {/* Profile Photo */}
          <div style={{
            position: 'absolute',
            top: '-75px',
            left: '20px'
          }}>
            {renderProfilePhoto()}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px'
          }}>
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#1877F2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#166fe5'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#1877F2'}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: isFollowing ? '#e4e6ea' : '#1877F2',
                  color: isFollowing ? '#1c1e21' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: followLoading ? 'default' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <Users size={16} />
                {followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
              </button>
            )}
          </div>

          {/* Profile Details */}
          <div style={{
            marginTop: '80px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1c1e21',
              margin: '0 0 8px 0'
            }}>
              {profile.name}
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#65676b',
              margin: '0 0 16px 0'
            }}>
              @{profile.username}
            </p>

            {profile.bio && (
              <p style={{
                fontSize: '16px',
                color: '#1c1e21',
                lineHeight: '1.4',
                margin: '0 0 16px 0'
              }}>
                {profile.bio}
              </p>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#65676b'
            }}>
              <Calendar size={16} />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '24px',
              fontSize: '15px'
            }}>
              <div>
                <span style={{
                  fontWeight: '700',
                  color: '#1c1e21'
                }}>
                  {profile.posts_count}
                </span>
                <span style={{
                  color: '#65676b',
                  marginLeft: '4px'
                }}>
                  Posts
                </span>
              </div>
              <div>
                <span style={{
                  fontWeight: '700',
                  color: '#1c1e21'
                }}>
                  {profile.followers_count}
                </span>
                <span style={{
                  color: '#65676b',
                  marginLeft: '4px'
                }}>
                  Followers
                </span>
              </div>
              <div>
                <span style={{
                  fontWeight: '700',
                  color: '#1c1e21'
                }}>
                  {profile.following_count}
                </span>
                <span style={{
                  color: '#65676b',
                  marginLeft: '4px'
                }}>
                  Following
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #dadde1',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1c1e21',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MessageCircle size={20} />
          Posts ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#65676b'
          }}>
            <p>No posts yet</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                actor={actor}
                currentUser={currentUser}
                onPostUpdate={() => {}} // Posts updates handled individually
                onPostDelete={() => loadUserPosts()} // Reload posts when one is deleted
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;