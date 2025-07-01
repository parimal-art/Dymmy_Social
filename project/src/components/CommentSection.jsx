import React, { useState, useEffect } from 'react';
import { Send, Heart, User, Trash2 } from 'lucide-react';

const CommentSection = ({ postId, actor, currentUser, onCommentUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState({});

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const postComments = await actor.get_post_comments(postId);
      setComments(postComments);
      
      // Load authors for all comments
      const authorIds = [...new Set(postComments.map(comment => comment.author.toString()))];
      const authorProfiles = {};
      
      for (const authorId of authorIds) {
        try {
          const profile = await actor.get_profile(authorId);
          if (profile && profile.length > 0) {
            authorProfiles[authorId] = profile[0];
          }
        } catch (error) {
          console.error(`Error loading author ${authorId}:`, error);
        }
      }
      
      setAuthors(authorProfiles);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      
      const commentRequest = {
        post_id: postId,
        content: newComment.trim()
      };

      const comment = await actor.create_comment(commentRequest);
      setComments([...comments, comment]);
      setNewComment('');
      
      // Update parent post comment count
      if (onCommentUpdate) {
        // This is a simplified update - in a real app you'd fetch the updated post
        onCommentUpdate({ comments_count: comments.length + 1 });
      }
      
      // Load author for new comment
      try {
        const profile = await actor.get_profile(comment.author);
        if (profile && profile.length > 0) {
          setAuthors(prev => ({ ...prev, [comment.author.toString()]: profile[0] }));
        }
      } catch (error) {
        console.error('Error loading comment author:', error);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const success = await actor.delete_comment(commentId);
      if (success) {
        setComments(comments.filter(comment => comment.id !== commentId));
        
        if (onCommentUpdate) {
          onCommentUpdate({ comments_count: Math.max(0, comments.length - 1) });
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
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

  const renderAuthorPhoto = (author) => {
    if (author?.profile_photo && author.profile_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(author.profile_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Author"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#e4e6ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <User size={16} color="#65676b" />
      </div>
    );
  };

  return (
    <div style={{
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #dadde1'
    }}>
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#e4e6ea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {currentUser?.profile_photo && currentUser.profile_photo.length > 0 ? (
              <img 
                src={URL.createObjectURL(new Blob([new Uint8Array(currentUser.profile_photo)]))}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <User size={16} color="#65676b" />
            )}
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              style={{
                width: '100%',
                padding: '8px 40px 8px 12px',
                border: '1px solid #dadde1',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f0f2f5'
              }}
            />
            
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: loading || !newComment.trim() ? '#e4e6ea' : '#1877F2',
                color: 'white',
                border: 'none',
                cursor: loading || !newComment.trim() ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {comments.map(comment => {
          const author = authors[comment.author.toString()];
          const isOwner = currentUser?.id?.toString() === comment.author.toString();
          
          return (
            <div key={comment.id} style={{
              display: 'flex',
              gap: '8px'
            }}>
              {renderAuthorPhoto(author)}
              
              <div style={{ flex: 1 }}>
                <div style={{
                  backgroundColor: '#f0f2f5',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1c1e21',
                    marginBottom: '2px'
                  }}>
                    {author?.name || 'Unknown User'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#1c1e21',
                    lineHeight: '1.3'
                  }}>
                    {comment.content}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px',
                  color: '#65676b',
                  paddingLeft: '12px'
                }}>
                  <span>{formatDate(comment.created_at)}</span>
                  
                  <button style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#65676b',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Like
                  </button>
                  
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#e41e3f',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={10} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentSection;