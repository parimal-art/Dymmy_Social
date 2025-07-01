import React from 'react';
import { Home, User, Users, Search, Settings } from 'lucide-react';

const Sidebar = ({ currentUser, activeView, onViewChange }) => {
  const menuItems = [
    { id: 'feed', icon: Home, label: 'Feed', count: null },
    { id: 'profile', icon: User, label: 'My Profile', count: null },
    { id: 'discover', icon: Search, label: 'Discover', count: null },
  ];

  const renderProfilePhoto = () => {
    if (currentUser?.profile_photo && currentUser.profile_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(currentUser.profile_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Profile"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '48px',
        height: '48px',
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

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: '80px',
      width: '280px',
      height: 'calc(100vh - 80px)',
      backgroundColor: 'white',
      borderRight: '1px solid #dadde1',
      padding: '20px',
      overflowY: 'auto'
    }}>
      {/* User Info */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #dadde1',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          {renderProfilePhoto()}
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1c1e21'
            }}>
              {currentUser?.name || 'Anonymous User'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#65676b'
            }}>
              @{currentUser?.username || 'user'}
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '14px'
        }}>
          <div>
            <span style={{ fontWeight: '600', color: '#1c1e21' }}>
              {currentUser?.followers_count || 0}
            </span>
            <span style={{ color: '#65676b', marginLeft: '4px' }}>
              Followers
            </span>
          </div>
          <div>
            <span style={{ fontWeight: '600', color: '#1c1e21' }}>
              {currentUser?.following_count || 0}
            </span>
            <span style={{ color: '#65676b', marginLeft: '4px' }}>
              Following
            </span>
          </div>
          <div>
            <span style={{ fontWeight: '600', color: '#1c1e21' }}>
              {currentUser?.posts_count || 0}
            </span>
            <span style={{ color: '#65676b', marginLeft: '4px' }}>
              Posts
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: isActive ? '#e7f3ff' : 'transparent',
                color: isActive ? '#1877F2' : '#65676b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                marginBottom: '4px',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = '#f0f2f5';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.count && (
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: '#1877F2',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;