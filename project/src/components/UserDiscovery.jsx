import React, { useState, useEffect } from 'react';
import { Search, Users, User, UserPlus, UserCheck } from 'lucide-react';

const UserDiscovery = ({ actor, currentUser, onUserSelect }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, allUsers]);

  const loadUsers = async () => {
    try {
      const users = await actor.get_all_users();
      // Filter out current user
      const otherUsers = users.filter(user => 
        user.id.toString() !== currentUser?.id?.toString()
      );
      setAllUsers(otherUsers);
      
      // Check following status for all users
      const statusMap = {};
      for (const user of otherUsers) {
        try {
          const isFollowing = await actor.is_following(user.id);
          statusMap[user.id.toString()] = isFollowing;
        } catch (error) {
          console.error(`Error checking follow status for ${user.id}:`, error);
          statusMap[user.id.toString()] = false;
        }
      }
      setFollowingStatus(statusMap);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleFollow = async (userId) => {
    try {
      const userIdStr = userId.toString();
      const isCurrentlyFollowing = followingStatus[userIdStr];
      
      if (isCurrentlyFollowing) {
        await actor.unfollow_user(userId);
      } else {
        await actor.follow_user(userId);
      }
      
      setFollowingStatus(prev => ({
        ...prev,
        [userIdStr]: !isCurrentlyFollowing
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    }
  };

  const renderProfilePhoto = (user) => {
    if (user.profile_photo && user.profile_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(user.profile_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Profile"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#e4e6ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <User size={24} color="#65676b" />
      </div>
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

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '20px',
        border: '1px solid #dadde1',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1c1e21',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Users size={32} color="#1877F2" />
          Discover People
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#65676b',
          margin: '0 0 24px 0'
        }}>
          Find and connect with other users on the platform
        </p>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search 
            size={20} 
            color="#65676b" 
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or username..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '1px solid #dadde1',
              borderRadius: '24px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1877F2'}
            onBlur={(e) => e.target.style.borderColor = '#dadde1'}
          />
        </div>
      </div>

      {/* Users List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #dadde1',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {filteredUsers.length === 0 ? (
          <div style={{
            padding: '60px',
            textAlign: 'center'
          }}>
            <Users size={48} color="#e4e6ea" style={{ marginBottom: '16px' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1c1e21',
              margin: '0 0 8px 0'
            }}>
              {searchQuery ? 'No users found' : 'No other users yet'}
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#65676b',
              margin: 0
            }}>
              {searchQuery 
                ? 'Try searching with different keywords'
                : 'Be the first to invite friends to the platform!'
              }
            </p>
          </div>
        ) : (
          <div>
            {filteredUsers.map((user, index) => {
              const isFollowing = followingStatus[user.id.toString()];
              
              return (
                <div
                  key={user.id.toString()}
                  style={{
                    padding: '20px',
                    borderBottom: index < filteredUsers.length - 1 ? '1px solid #dadde1' : 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                      onClick={() => onUserSelect(user.id)}
                    >
                      {renderProfilePhoto(user)}
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1c1e21',
                          margin: '0 0 4px 0'
                        }}>
                          {user.name}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#65676b',
                          margin: '0 0 8px 0'
                        }}>
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p style={{
                            fontSize: '14px',
                            color: '#1c1e21',
                            margin: '0 0 8px 0',
                            lineHeight: '1.3'
                          }}>
                            {user.bio.length > 100 
                              ? `${user.bio.substring(0, 100)}...`
                              : user.bio
                            }
                          </p>
                        )}
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '13px',
                          color: '#65676b'
                        }}>
                          <span>{user.posts_count} posts</span>
                          <span>{user.followers_count} followers</span>
                          <span>{user.following_count} following</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFollow(user.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: isFollowing ? '#e4e6ea' : '#1877F2',
                        color: isFollowing ? '#1c1e21' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        minWidth: '120px',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => {
                        if (isFollowing) {
                          e.target.style.backgroundColor = '#dadde1';
                        } else {
                          e.target.style.backgroundColor = '#166fe5';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (isFollowing) {
                          e.target.style.backgroundColor = '#e4e6ea';
                        } else {
                          e.target.style.backgroundColor = '#1877F2';
                        }
                      }}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck size={16} />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDiscovery;