import axios from 'axios';
import { kakaoReqMeUrl, kakaoTokenUrl } from '../constant/url';
import { auth } from '../utils/firebase';

export const getToken = async (code) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID,
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      code
    };

    const res = await axios.post(kakaoTokenUrl, new URLSearchParams(body));
    return res.data;
  } catch (error) {
    throw new Error('카카오 토큰 요청 Error: ', error);
  }
};

// id_token 은 저장해도 될 것 같다.
// DB저장 -> access_token(선택), refresh_token(필수)
export const getKakaoUser = async (token) => {
  try {
    const res = await axios.get(kakaoReqMeUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res);
    return res.data;
  } catch (error) {
    throw new Error('카카오 유저정보 요청 error: ', error);
  }
};
export const updateOrCreateUser = async (user) => {
  const kakaoAccount = user.kakao_account;
  const properties = {
    uid: `kakao:${user.id}`,
    provider: 'kakao',
    displayName: kakaoAccount?.profile?.nickname,
    email: kakaoAccount?.email
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

// 추후 토큰 효율적으로 사용하기 위해
export async function refreshAccessToken(refreshToken) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    };

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', process.env.KAKAO_CLIENT_ID);
    params.append('refresh_token', refreshToken);

    const response = await axios.post(kakaoTokenUrl, params, config);
    return response.data;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}
