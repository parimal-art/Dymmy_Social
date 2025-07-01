import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, User } from 'lucide-react';
import CommentSection from './CommentSection';

const PostCard = ({ post, actor, currentUser, onPostUpdate, onPostDelete }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [author, setAuthor] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadAuthor();
    checkIfLiked();
  }, [post.author]);

  const loadAuthor = async () => {
    try {
      const authorProfile = await actor.get_profile(post.author);
      if (authorProfile && authorProfile.length > 0) {
        setAuthor(authorProfile[0]);
      }
    } catch (error) {
      console.error('Error loading author:', error);
    }
  };

  const checkIfLiked = async () => {
    try {
      const isLiked = await actor.is_post_liked(post.id);
      setLiked(isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    try {
      let updatedPost;
      if (liked) {
        await actor.unlike_post(post.id);
        updatedPost = { ...post, likes_count: Math.max(0, post.likes_count - 1) };
        setLiked(false);
      } else {
        await actor.like_post(post.id);
        updatedPost = { ...post, likes_count: post.likes_count + 1 };
        setLiked(true);
      }
      onPostUpdate(updatedPost);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    try {
      const sharedPost = await actor.share_post(post.id);
      const updatedPost = { ...post, shares_count: post.shares_count + 1 };
      onPostUpdate(updatedPost);
      alert('Post shared successfully!');
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Failed to share post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const success = await actor.delete_post(post.id);
      if (success && onPostDelete) {
        onPostDelete(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString();
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    const mediaBlob = new Blob([new Uint8Array(post.media)]);
    const mediaUrl = URL.createObjectURL(mediaBlob);

    return (
      <div style={{
        marginTop: '12px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #dadde1'
      }}>
        {post.media_type?.[0]?.startsWith('image/') ? (
          <img
            src={mediaUrl}
            alt="Post media"
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'cover'
            }}
          />
        ) : post.media_type?.[0]?.startsWith('video/') ? (
          <video
            src={mediaUrl}
            controls
            style={{
              width: '100%',
              maxHeight: '400px'
            }}
          />
        ) : null}
      </div>
    );
  };

  const renderAuthorPhoto = () => {
    if (author?.profile_photo && author.profile_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(author.profile_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Author"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#e4e6ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <User size={20} color="#65676b" />
      </div>
    );
  };

  const isOwner = currentUser?.id?.toString() === post.author.toString();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #dadde1',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {renderAuthorPhoto()}
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#1c1e21'
            }}>
              {author?.name || 'Unknown User'}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#65676b'
            }}>
              @{author?.username || 'unknown'} • {formatDate(post.created_at)}
            </div>
          </div>
        </div>

        {isOwner && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f0f2f5'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <MoreHorizontal size={16} color="#65676b" />
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #dadde1',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 10,
                minWidth: '120px'
              }}>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#e41e3f'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f0f2f5'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        fontSize: '15px',
        lineHeight: '1.4',
        color: '#1c1e21',
        marginBottom: '12px'
      }}>
        {post.content}
      </div>

      {/* Media */}
      {renderMedia()}

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid #dadde1',
        marginTop: '12px'
      }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: liked ? '#e41e3f' : '#65676b',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f0f2f5'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <Heart size={16} fill={liked ? '#e41e3f' : 'none'} />
          {post.likes_count} Like{post.likes_count !== 1 ? 's' : ''}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#65676b',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f0f2f5'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <MessageCircle size={16} />
          {post.comments_count} Comment{post.comments_count !== 1 ? 's' : ''}
        </button>

        <button
          onClick={handleShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#65676b',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f0f2f5'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <Share size={16} />
          {post.shares_count} Share{post.shares_count !== 1 ? 's' : ''}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={post.id}
          actor={actor}
          currentUser={currentUser}
          onCommentUpdate={(updatedPost) => onPostUpdate(updatedPost)}
        />
      )}
    </div>
  );
};

export default PostCard;