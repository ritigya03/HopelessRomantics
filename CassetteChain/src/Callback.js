// CallbackComponent.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CallbackComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    
    if (code) {
      axios.post('http://localhost:5000/api/login', { code })
        .then(response => {
          const { accessToken, refreshToken, userId } = response.data;
          
          // Store tokens and userId in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('userId', userId);
          
          navigate('/playlists'); // Redirect to playlists page
        })
        .catch(error => {
          console.error('Login error:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>Processing login...</div>;
};

export default CallbackComponent;