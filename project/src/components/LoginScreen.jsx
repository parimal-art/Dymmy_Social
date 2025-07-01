import React from 'react';
import { Users, Lock, Globe } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <div style={{
          marginBottom: '40px'
        }}>
          <div style={{
            backgroundColor: '#1877F2',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'pulse 2s infinite'
          }}>
            <Users size={40} color="white" />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1c1e21',
            marginBottom: '10px'
          }}>
            DecentraSocial
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#65676b',
            marginBottom: '30px'
          }}>
            The future of social media on blockchain
          </p>
        </div>

        <div style={{
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f0f2f5',
            borderRadius: '12px'
          }}>
            <Lock size={20} color="#1877F2" style={{ marginRight: '15px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', color: '#1c1e21', fontSize: '14px' }}>
                Secure Authentication
              </div>
              <div style={{ color: '#65676b', fontSize: '12px' }}>
                Login with Internet Identity
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#f0f2f5',
            borderRadius: '12px'
          }}>
            <Globe size={20} color="#42B883" style={{ marginRight: '15px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', color: '#1c1e21', fontSize: '14px' }}>
                Fully Decentralized
              </div>
              <div style={{ color: '#65676b', fontSize: '12px' }}>
                Your data, your control
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onLogin}
          style={{
            width: '100%',
            padding: '16px 24px',
            backgroundColor: '#1877F2',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#166fe5';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(24, 119, 242, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#1877F2';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.3)';
          }}
        >
          Connect with Internet Identity
        </button>

        <p style={{
          marginTop: '30px',
          fontSize: '12px',
          color: '#8a8d91',
          lineHeight: '1.5'
        }}>
          By connecting, you agree to our decentralized platform's commitment to privacy and user ownership of data.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;