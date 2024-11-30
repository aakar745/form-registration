import axios from '../config/axios';

export const handleLogin = async (formData) => {
  const response = await axios.post('/api/auth/login', formData);
  return response.data;
};

export const handleMfaVerification = async (code, tempToken) => {
  const response = await axios.post('/api/auth/mfa/verify', {
    code,
    tempToken
  });
  return response.data;
};
