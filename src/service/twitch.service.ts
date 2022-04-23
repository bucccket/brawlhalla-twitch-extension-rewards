import { Injectable } from '@angular/core';
import {default as axios} from 'axios';
import { EmailService } from './email.service';
import { ProxyService } from './proxy.service';
import { RequestService } from './request.service';

const brawlhallaId = 75346877;
const clientId = 'getyoowndamnclientid';

@Injectable({
  providedIn: 'root'
})
export class TwitchService {

  clientId: string;

  constructor(
    private emailService: EmailService,
    private request: RequestService,
    private proxy: ProxyService
  ) { 
    this.clientId = clientId;
  }

  async login(username, password, extra?) {
    let data: any = {
      username,
      password,
      client_id: this.clientId
    };
    if(extra) {
      if(extra.captcha) {
        data.arkose = {
          token: extra.captcha
        }
      }
      if(extra.twitchguard)
        data.twitchguard_code = extra.twitchguard;
    }

    const response = await this.request.request({
      method: 'POST',
      baseUrl: 'https://passport.twitch.tv',
      url: '/login',
      json: true,
      body: data
    });
  
    return response;
  }

  async register(username, password, captcha) {
    const data = {
      username,
      password,
      email: this.emailService.getEmailAddress(username),
      birthday: {
        day: Math.floor(Math.random()*25)+1,
        month: Math.floor(Math.random()*10)+1,
        year: Math.floor(Math.random()*7)+1990
      },
      client_id: this.clientId,
      arkose: {
        token: captcha
      }
    }
    const response = await this.request.request({
      method: 'POST',
      baseUrl: 'https://passport.twitch.tv',
      url: '/register',
      json: true,
      body: data
    }, true);
  
    return response;
  }

  async getExtensionData(oauth) {
    return await this.request.request({
      method: 'GET',
      baseUrl: 'https://api.twitch.tv',
      url: `/v5/channels/${brawlhallaId}/extensions`,
      headers: {
        "Client-Id": clientId,
        "Authorization": oauth
      }
    });
  }

  async resendCode(username) {
    return await this.request.request({
      method: 'POST',
      baseUrl: 'https://passport.twitch.tv',
      url: `/resend_login_verification_email?login=${username}`
    });
  }

  async getStream(username, oauth) {
    const response = await this.request.request({
      method: 'GET',
      baseUrl: 'https://api.twitch.tv',
      url: `/helix/streams?user_login=${username}`,
      headers: {
        "Client-Id": this.clientId,
        "Authorization": oauth.replace('OAuth', 'Bearer')
      },
      json: true
    });

    if(!response.data) {
      return false;
    }

    return response.data.data;
  }

  async isLive(username, oauth) {
    const resp = await this.getStream(username, oauth);
    if(!resp) {
      return false;
    }
    return !!resp.length;
  }

  async managePermissions(extensionId, allow, oauth, jwt) {
    return await this.request.request({
      method: 'POST',
      baseUrl: 'https://api.twitch.tv',
      url: `/v5/extensions/l5k0yc8ftbcmpcid4oodw3hevgbnwm/auth/link_user`,
      headers: {
        "Client-Id": clientId,
        "Authorization": oauth
      },
      json: true,
      body: {
        show_user: allow,
        token: jwt
      }
    });
  }
}
