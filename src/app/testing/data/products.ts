import * as models from '@models';

export const testProduct: models.Sentinel1Product = {
  id: 'some id',
  name: 'SomeGranule',
  file: 'SomeGranule.zip',
  downloadUrl: 'www.download.edu',
  bytes: 7,
  browse: 'browse.png',
  platform: 'Sentinel-1A',
  groupId: '7',
  metadata: {
    date: new Date('December 17, 1995 03:24:00'),
    polygon: 'POINT(-121.28,58.76)',

    productType: 'GRD',
    beamMode: 'IW',
    polarization: 'HH',
    flightDirection: models.FlightDirection.ASCENDING,
    frequency: '7',

    path: 7,
    frame: 7,
    absoluteOrbit: 7,
  }
};