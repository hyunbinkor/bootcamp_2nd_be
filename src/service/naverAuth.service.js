import axios from 'axios';
import { naverReqMeUrl, naverTokenUrl } from '../constant/url';
import { auth } from '../utils/firebase';
// https://nid.naver.com/oauth2.0/authorize GET/POST - 네이버 로그인 인증을 요청합니다.
// https://nid.naver.com/oauth2.0/token GET/POST JSON 접근 토큰의 발급, 갱신, 삭제를 요청합니다.

export const getNaverToken = async (code) => {
  const body = {
    grant_type: 'authorization_code',
    client_id: process.env.NAVER_CLIENT_ID,
    client_secret: process.env.NAVER_SECRET_KEY,
    redirect_uri: process.env.NAVER_REDIRECT_URI,
    code,
    state: 'RAMDOM_STATE'
  };

  const res = await axios.post(naverTokenUrl, new URLSearchParams(body));

  console.log(res);
  return res;
};

export const getNaverUser = async (token) => {
  console.log(token);
  const res = await axios.get(naverReqMeUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(res);
  return res.data;
};
export const updateOrCreateUser = async (user) => {
  const kakaoAccount = user.kakao_account;
  const properties = {
    uid: `naver:${user.id}`,
    provider: 'naver',
    displayName: kakaoAccount?.profile?.nickname ?? 'anonymous',
    email: kakaoAccount?.email ?? 'example@example.com'
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
