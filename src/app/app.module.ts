import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';

import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { reducers, metaReducers, appEffects } from './store';

import { SidebarModule } from '@components/sidebar';
import { SpreadsheetModule } from '@components/spreadsheet';
import { MapModule } from '@components/map';
import { FileUploadModule } from '@components/file-upload';

import { AsfApiService, UrlStateService, MapService } from './services';
import { environment } from './../environments/environment';

import { AppComponent } from './app.component';


export const routes = [
  { path: '**', name: 'AppComponent', component: AppComponent },
];


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    RouterModule.forRoot(routes, { useHash: true }),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(appEffects),
    !environment.production ? StoreDevtoolsModule.instrument() : [],

    SidebarModule,
    SpreadsheetModule,
    MapModule,
    FileUploadModule,
  ],
  providers: [
    AsfApiService,
    UrlStateService,
    MapService,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
