import React, { useState, useEffect } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import LoadingSpinner from './LoadingSpinner';

const Feed = ({ actor, currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [actor]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feedPosts = await actor.get_feed();
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadFeed();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Create Post */}
      <CreatePost 
        actor={actor} 
        currentUser={currentUser}
        onPostCreated={handlePostCreated}
      />

      {/* Refresh Button */}
      <div style={{
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '8px 16px',
            backgroundColor: refreshing ? '#e4e6ea' : '#1877F2',
            color: refreshing ? '#65676b' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: refreshing ? 'default' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Feed'}
        </button>
      </div>

      {/* Posts */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {posts.length === 0 ? (
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
              No posts to show yet. Follow some users or create your first post!
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              actor={actor}
              currentUser={currentUser}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;