import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Feed from './Feed';
import UserProfile from './UserProfile';
import EditProfile from './EditProfile';
import UserDiscovery from './UserDiscovery';

const Dashboard = ({ actor, currentUser, onLogout, onUserUpdate }) => {
  const [activeView, setActiveView] = useState('feed');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const renderContent = () => {
    switch (activeView) {
      case 'feed':
        return <Feed actor={actor} currentUser={currentUser} />;
      case 'profile':
        return (
          <UserProfile 
            actor={actor} 
            currentUser={currentUser} 
            userId={selectedUserId || currentUser?.id}
            onEditProfile={() => setActiveView('edit-profile')}
          />
        );
      case 'edit-profile':
        return (
          <EditProfile 
            actor={actor} 
            currentUser={currentUser} 
            onSave={(updatedUser) => {
              onUserUpdate(updatedUser);
              setActiveView('profile');
            }}
            onCancel={() => setActiveView('profile')}
          />
        );
      case 'discover':
        return (
          <UserDiscovery 
            actor={actor} 
            currentUser={currentUser}
            onUserSelect={(userId) => {
              setSelectedUserId(userId);
              setActiveView('profile');
            }}
          />
        );
      default:
        return <Feed actor={actor} currentUser={currentUser} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header 
        currentUser={currentUser} 
        onLogout={onLogout}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <div style={{
        display: 'flex',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '80px'
      }}>
        <Sidebar 
          currentUser={currentUser}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        
        <div style={{
          flex: 1,
          padding: '20px',
          marginLeft: '280px'
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;