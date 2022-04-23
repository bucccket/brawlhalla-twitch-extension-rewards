import { Injectable } from '@angular/core';
import {default as axios} from 'axios';
import { Observable, of, Subject } from 'rxjs';
import { Progress } from '../models/progress';
import { RequestService } from './request.service';
import { TwitchService } from './twitch.service';

const extensionId = 'l5k0yc8ftbcmpcid4oodw3hevgbnwm';

@Injectable({
  providedIn: 'root'
})
export class BrawlhallaService {

  stop: Subject<void> = new Subject();

  constructor(
    private request: RequestService,
    private twitch: TwitchService
  ) { }

  async sendActive(authToken) {
    return await this.request.request({
      method: 'POST',
      baseUrl: 'https://2rcwzehruc.execute-api.us-east-1.amazonaws.com',
      url: '/viewer/active',
      headers: {
        "Content-Type": "application/json",
        "Authorization": authToken
      },
      json: true,
      body: {}
    });
  }  

  async getAssets(authToken) {
    return await this.request.request({
      method: 'GET',
      baseUrl: 'https://2rcwzehruc.execute-api.us-east-1.amazonaws.com',
      url: '/rewards/assets',
      headers: {
        "Content-Type": "application/json",
        "Authorization": authToken
      }
    });
  }

  async getProgress(authToken, username) {
    const response = await this.request.request({
      method: 'GET',
      baseUrl: 'https://2rcwzehruc.execute-api.us-east-1.amazonaws.com',
      url: '/viewer/progress',
      headers: {
        "Content-Type": "application/json",
        "Authorization": authToken
      }
    });

    if(!response || !response.data) {
      return;
    }

    if(response.data) {
      if(response.data == 'error') {
        console.error('Get progress returned \'error\'');
        return;
      }
      if(response.data == 'invalid token...') {
        this.stop.next();
        return;
      }

      if(response.data.message) {
        return;
      }

      const progress = response.data as Progress;

      const prevData = JSON.parse(localStorage.getItem('brawlhalla-rewards-progress-storage')) || {};
      if(!!prevData[username]) {
        delete prevData[username];
      }
      prevData[username] = progress;
      localStorage.setItem('brawlhalla-rewards-progress-storage', JSON.stringify(prevData));
    }
  }

  grantPermission(oauth, jwt) {
    return this.twitch.managePermissions(extensionId, true, oauth, jwt);
  }
}
