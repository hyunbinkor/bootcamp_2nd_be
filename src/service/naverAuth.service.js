import axios from 'axios';
import { naverReqMeUrl, naverTokenUrl } from '../constant/url';
import { auth } from '../utils/firebase';

export const getNaverToken = async (code) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.NAVER_CLIENT_ID,
      client_secret: process.env.NAVER_SECRET_KEY,
      redirect_uri: process.env.NAVER_REDIRECT_URI,
      code,
      state: 'RAMDOM_STATE'
    };

    const res = await axios.post(naverTokenUrl, new URLSearchParams(body));
    return res.data;
  } catch (error) {
    throw new Error('네이버 토큰 요청 Error: ', error);
  }
};

export const getNaverUser = async (token) => {
  try {
    const res = await axios.get(naverReqMeUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw new Error('네이버 유저정보 요청 Error: ', error);
  }
};

export const updateOrCreateNaverUser = async (user) => {
  const properties = {
    uid: `naver:${user.id}`,
    provider: 'naver',
    displayName: user?.name ?? 'anonymous',
    email: user?.email ?? 'example@example.com'
  };
  try {
    return await auth.updateUser(properties.uid, properties);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return auth.createUser(properties);
    }
    throw error;
  }
};
