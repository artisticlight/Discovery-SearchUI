import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MatBadgeModule, MatMenuModule } from '@angular/material';

import { MatSharedModule } from '@shared';
import { NavBarComponent } from './nav-bar.component';

@NgModule({
  declarations: [
    NavBarComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatBadgeModule,
    MatMenuModule,
    MatSharedModule,
  ],
  exports: [
    NavBarComponent
  ]
})
export class NavBarModule { }
