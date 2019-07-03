import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSharedModule } from '@shared';

import { NavButtonsComponent } from './nav-buttons.component';

@NgModule({
  declarations: [NavButtonsComponent],
  imports: [
    CommonModule,

    MatBadgeModule,
    MatMenuModule,
    MatInputModule,
    MatSharedModule,
  ],
  exports: [NavButtonsComponent],
})
export class NavButtonsModule { }