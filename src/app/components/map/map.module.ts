import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatBadgeModule, MatDialogModule } from '@angular/material';

import { MatSharedModule } from '@shared';

import { MapComponent } from './map.component';
import { MapControlsModule } from './map-controls';
import { FileUploadModule } from './file-upload';
import { AttributionsComponent } from './attributions/attributions.component';

@NgModule({
  imports: [
    CommonModule,

    MatDialogModule,

    MatSharedModule,

    MapControlsModule,
    FileUploadModule,
  ],
  declarations: [
    MapComponent,
    AttributionsComponent
  ],
  exports: [
    MapComponent
  ]
})
export class MapModule { }
