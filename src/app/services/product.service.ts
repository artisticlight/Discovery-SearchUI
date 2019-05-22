import { Injectable } from '@angular/core';

import * as models from '@models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  public fromResponse = (resp: any) => (
    (resp.results || [])
    .map(
      (g: any): models.CMRProduct => ({
        name: g.granuleName,
        file: g.fileName,
        id: g.productID,
        downloadUrl: g.downloadUrl,
        bytes: g.sizeMB * 1000000,
        platform: g.platform,
        browse: g.browse || 'assets/error.png',
        groupId: g.groupID,
        metadata: this.getMetadataFrom(g)
      })
    )
  )

  private getMetadataFrom =
    (g: any): models.CMRProductMetadata => ({
      date:  this.fromCMRDate(g.startTime),
      polygon: g.wkt,

      productType: <models.CMRProductType>g.productType,
      beamMode: <models.Sentinel1BeamMode>g.beamMode,
      polarization: <models.Sentinel1Polarization>g.polarization,
      flightDirection: <models.FlightDirection>g.flightDirection,
      frequency: g.frequency || 'NA',

      path: +g.path,
      frame:  +g.frame,
      absoluteOrbit: +g.orbit
    })

  private fromCMRDate =
    (dateString: string): Date => new Date(dateString)
}
