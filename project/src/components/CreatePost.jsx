import React, { useState } from 'react';
import { Image, Video, Send, X } from 'lucide-react';

const CreatePost = ({ actor, currentUser, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      setMedia(Array.from(uint8Array));
      setMediaType(file.type);
      setMediaPreview(URL.createObjectURL(file));
    };
    reader.readAsArrayBuffer(file);
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaType(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !media) {
      alert('Please add some content or media to your post');
      return;
    }

    try {
      setPosting(true);
      
      const postRequest = {
        content: content.trim(),
        media: media ? [media] : [],
        media_type: mediaType ? [mediaType] : []
      };

      const newPost = await actor.create_post(postRequest);
      
      setContent('');
      removeMedia();
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      border: '1px solid #dadde1',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '12px'
        }}>
          {/* Profile Photo */}
          <div style={{
            width: '40px',
            height: '40px',
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
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#65676b',
                borderRadius: '50%'
              }} />
            )}
          </div>

          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${currentUser?.name || 'friend'}?`}
            style={{
              flex: 1,
              minHeight: '80px',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#f0f2f5',
              fontSize: '16px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div style={{
            position: 'relative',
            marginBottom: '12px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #dadde1'
          }}>
            {mediaType?.startsWith('image/') ? (
              <img
                src={mediaPreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover'
                }}
              />
            ) : mediaType?.startsWith('video/') ? (
              <video
                src={mediaPreview}
                controls
                style={{
                  width: '100%',
                  maxHeight: '300px'
                }}
              />
            ) : null}
            
            <button
              type="button"
              onClick={removeMedia}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #dadde1'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              color: '#65676b',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f2f5'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Image size={16} />
              Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                style={{ display: 'none' }}
              />
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              color: '#65676b',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f2f5'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Video size={16} />
              Video
              <input
                type="file"
                accept="video/*"
                onChange={handleMediaUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={posting || (!content.trim() && !media)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: posting || (!content.trim() && !media) ? '#e4e6ea' : '#1877F2',
              color: posting || (!content.trim() && !media) ? '#65676b' : 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: posting || (!content.trim() && !media) ? 'default' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={16} />
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;