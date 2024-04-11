import dotenv from 'dotenv';
import * as env from 'env-var';

dotenv.config();

export const port = env.get('PORT').asInt();
export const jwtSecretKey = env.get('JWT_SCRET_KEY').asString();
export const kakaoClientId = env.get('KAKAO_CLIENT_ID').asString();
export const kakaoRedirectUri = env.get('KAKAO_REDIRECT_URI').asUrlString();
export const kakaoSecret = env.get('KAKAO_SECRET_KEY').asString();
export const naverClientId = env.get('NAVER_CLIENT_ID').asString();
export const naverSecretKey = env.get('NAVER_SECRET_KEY').asString();
export const naverRedirectUri = env.get('NAVER_REDIRECT_URI').asUrlString();
export const storeBucketName = env.get('BUCKET_NAME').asString();
