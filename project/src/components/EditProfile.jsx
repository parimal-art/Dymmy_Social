import React, { useState } from 'react';
import { Save, X, Camera, Upload } from 'lucide-react';

const EditProfile = ({ actor, currentUser, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 2MB for profile photos)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      const preview = URL.createObjectURL(file);
      
      if (type === 'profile') {
        setProfilePhoto(Array.from(uint8Array));
        setProfilePreview(preview);
      } else {
        setCoverPhoto(Array.from(uint8Array));
        setCoverPreview(preview);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      setLoading(true);
      
      const updateRequest = {
        name: formData.name.trim() !== currentUser?.name ? [formData.name.trim()] : [],
        username: formData.username.trim() !== currentUser?.username ? [formData.username.trim()] : [],
        bio: formData.bio.trim() !== currentUser?.bio ? [formData.bio.trim()] : [],
        profile_photo: profilePhoto ? [profilePhoto] : [],
        cover_photo: coverPhoto ? [coverPhoto] : []
      };

      const updatedProfile = await actor.update_profile(updateRequest);
      onSave(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentProfilePhoto = () => {
    if (profilePreview) {
      return (
        <img 
          src={profilePreview}
          alt="Profile preview"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
    
    if (currentUser?.profile_photo && currentUser.profile_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(currentUser.profile_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Current profile"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
    
    return (
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: '#e4e6ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Camera size={40} color="#65676b" />
      </div>
    );
  };

  const renderCurrentCoverPhoto = () => {
    if (coverPreview) {
      return (
        <img 
          src={coverPreview}
          alt="Cover preview"
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      );
    }
    
    if (currentUser?.cover_photo && currentUser.cover_photo.length > 0) {
      const photoBlob = new Blob([new Uint8Array(currentUser.cover_photo)]);
      const photoUrl = URL.createObjectURL(photoBlob);
      return (
        <img 
          src={photoUrl}
          alt="Current cover"
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      );
    }
    
    return (
      <div style={{
        width: '100%',
        height: '200px',
        backgroundColor: '#e4e6ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Upload size={40} color="white" />
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        border: '1px solid #dadde1',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1c1e21',
            margin: 0
          }}>
            Edit Profile
          </h1>
          
          <button
            onClick={onCancel}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e4e6ea',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} color="#65676b" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Cover Photo */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1c1e21',
              marginBottom: '8px'
            }}>
              Cover Photo
            </label>
            
            <div style={{ position: 'relative' }}>
              {renderCurrentCoverPhoto()}
              
              <label style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, 'cover')}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Profile Photo */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1c1e21',
              marginBottom: '8px'
            }}>
              Profile Photo
            </label>
            
            <div style={{ 
              position: 'relative',
              display: 'inline-block'
            }}>
              {renderCurrentProfilePhoto()}
              
              <label style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                backgroundColor: '#1877F2',
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid white'
              }}>
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, 'profile')}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1c1e21',
              marginBottom: '6px'
            }}>
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #dadde1',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1877F2'}
              onBlur={(e) => e.target.style.borderColor = '#dadde1'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1c1e21',
              marginBottom: '6px'
            }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #dadde1',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1877F2'}
              onBlur={(e) => e.target.style.borderColor = '#dadde1'}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1c1e21',
              marginBottom: '6px'
            }}>
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell people about yourself..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #dadde1',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1877F2'}
              onBlur={(e) => e.target.style.borderColor = '#dadde1'}
            />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                backgroundColor: '#e4e6ea',
                color: '#1c1e21',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dadde1'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#e4e6ea'}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: loading ? '#e4e6ea' : '#1877F2',
                color: loading ? '#65676b' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'default' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#166fe5';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#1877F2';
                }
              }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;