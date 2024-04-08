import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecretKey } from '../constant/env';
import { frontendUrl } from '../constant/url';
import OAuthService from '../service/oauth.service';

export const oauthRouter = Router();

const authKakao = new OAuthService('kakao');
const authNaver = new OAuthService('naver');

oauthRouter.get('/kakao', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: 'code is a required parameter.'
      });
    }
    const response = await authKakao.getToken(code);
    const token = response.access_token;
    const kakaoUser = await authKakao.getUser(token);
    const userCheck = await authKakao.userCheck(kakaoUser.id);

    let authUser;
    try {
      authUser = await authKakao.updateOrCreateUser(
        kakaoUser,
        response.refresh_token
      );
    } catch (updateOrCreateError) {
      console.error('Error updating or creating user:', updateOrCreateError);
      throw new Error('유저 업데이트 또는 생성 에러');
    }
    // jwt 생성
    const accessToken = jwt.sign({ uid: authUser.uid }, jwtSecretKey, {
      expiresIn: '24h'
    });

    const treeId = await authKakao.userTreeFind(authUser.uid);

    // 질문 입력 여부에 따라 리디렉션할 경로 결정
    const redirectPath = userCheck ? `/host/tree/${treeId}` : '/host/question';
    return res
      .cookie('accessToken', accessToken, { httpOnly: true })
      .cookie('kakaoToken', token, { httpOnly: true })
      .redirect(frontendUrl + redirectPath);
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ message: '카카오 로그인에 실패했습니다.' });
  }
});

oauthRouter.get('/naver', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: 'code is a required parameter.'
      });
    }

    const response = await authNaver.getToken(code); // 네이버 OAuth를 통해 액세스 토큰을 받아옴
    const naverUser = await authNaver.getUser(response.access_token); // 액세스 토큰을 사용하여 네이버 사용자 정보를 가져옴
    const userCheck = await authNaver.userCheck(naverUser.id);
    // 이후에 필요한 처리를 수행하고 클라이언트에게 응답을 보냄
    let authUser;
    try {
      authUser = await authNaver.updateOrCreateUser(
        naverUser.response,
        response.refresh_token
      );
    } catch (updateOrCreateError) {
      console.error('Error updating or creating user:', updateOrCreateError);
      throw new Error(updateOrCreateError);
    }
    const accessToken = jwt.sign({ uid: authUser.uid }, jwtSecretKey, {
      expiresIn: '24h'
    });
    const treeId = await authNaver.userTreeFind(authUser.uid);

    // 질문 입력 여부에 따라 리디렉션할 경로 결정
    const redirectPath = userCheck ? `/host/tree/${treeId}` : '/host/question';
    return res
      .cookie('accessToken', accessToken, { httpOnly: true })
      .cookie('naverToken', response.access_token, { httpOnly: true })
      .redirect(frontendUrl + redirectPath);
  } catch (error) {
    res.status(500).json({ message: '네이버 로그인에 실패하였습니다.' });
    throw new Error(error);
  }
});
