import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSharedModule } from '@shared';

import { MapComponent } from './map.component';
import { ViewSelectorComponent } from './view-selector';
import { DrawSelectorComponent } from './draw-selector/draw-selector.component';

@NgModule({
  imports: [
    CommonModule,

    MatButtonToggleModule,
    MatSharedModule
  ],
  declarations: [
    MapComponent,
    ViewSelectorComponent,
    DrawSelectorComponent,
  ],
  exports: [
    MapComponent
  ]
})
export class MapModule { }
