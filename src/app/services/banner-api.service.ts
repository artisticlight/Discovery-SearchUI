import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { BannerApiResponse } from '@models';

@Injectable({
  providedIn: 'root'
})
export class BannerApiService {

  constructor() { }

  public load(): Observable<BannerApiResponse> {
    return of({
      banners: [
        {
          text:
            '<p>' +
            'Looking for the old Vertex design?' +
            ' It will remain available ' +
            '<a href="https://vertex-retired.daac.asf.alaska.edu">here</a> until August 19, 2019' +
            '</p>'
          ,
          type: 'message',
          target: [
            'sar-search'
          ]
        }
      ],
      systime: ''
    });
  }
}
