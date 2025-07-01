import React from 'react';
import { Search, Home, Users, User, LogOut } from 'lucide-react';

const Header = ({ currentUser, onLogout, activeView, onViewChange }) => {
  const renderProfilePhoto = () => {
    if (currentUser?.profile_photo && currentUser.profile_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(currentUser.profile_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Profile"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
    return <User size={20} color="#65676b" />;
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderBottom: '1px solid #dadde1',
      padding: '12px 20px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: '#1877F2',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          <Users size={24} color="white" />
        </div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1877F2',
          margin: 0
        }}>
          DecentraSocial
        </h1>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <button
          onClick={() => onViewChange('feed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: activeView === 'feed' ? '#e7f3ff' : 'transparent',
            color: activeView === 'feed' ? '#1877F2' : '#65676b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (activeView !== 'feed') {
              e.target.style.backgroundColor = '#f0f2f5';
            }
          }}
          onMouseOut={(e) => {
            if (activeView !== 'feed') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Home size={20} />
          Feed
        </button>

        <button
          onClick={() => onViewChange('discover')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: activeView === 'discover' ? '#e7f3ff' : 'transparent',
            color: activeView === 'discover' ? '#1877F2' : '#65676b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (activeView !== 'discover') {
              e.target.style.backgroundColor = '#f0f2f5';
            }
          }}
          onMouseOut={(e) => {
            if (activeView !== 'discover') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Search size={20} />
          Discover
        </button>
      </div>

      {/* User Menu */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={() => onViewChange('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: activeView === 'profile' ? '#e7f3ff' : 'transparent',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (activeView !== 'profile') {
              e.target.style.backgroundColor = '#f0f2f5';
            }
          }}
          onMouseOut={(e) => {
            if (activeView !== 'profile') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          {renderProfilePhoto()}
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1c1e21'
          }}>
            {currentUser?.name || 'User'}
          </span>
        </button>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            border: '1px solid #dadde1',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f0f2f5';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={16} color="#65676b" />
        </button>
      </div>
    </header>
  );
};

export default Header;