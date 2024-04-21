import MessageService from './message.service';
import OAuthService from './oauth.service';
import TreeService from './tree.service';

export const messageService = new MessageService();
export const authKakao = new OAuthService('kakao');
export const authNaver = new OAuthService('naver');
export const treeService = new TreeService();
