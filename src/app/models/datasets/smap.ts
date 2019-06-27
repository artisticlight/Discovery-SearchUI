export const smap = {
  name: 'SMAP',
  apiValue: { platform: 'SMAP' },
  date: { start: new Date(2015, 0, 15) },
  infoUrl: 'https://www.asf.alaska.edu/smap/',
  frequency: 'L-Band',
  source: {
    name: 'NASA',
    url: 'https://www.nasa.gov/'
  },
  citationUrl: 'https://www.asf.alaska.edu/smap/how-to-cite/',
  productTypes: [{
    apiValue: 'L1A_Radar_RO_QA',
    displayName: 'L1A Radar Receive Only Data Quality'
  }, {
    apiValue: 'L1C_S0_HiRes_QA',
    displayName: 'L1C S0 HiRes Data Quality Information'
  }, {
    apiValue: 'L1A_Radar_RO_ISO_XML',
    displayName: 'L1A Radar Receive Only Product Metadata'
  }, {
    apiValue: 'L1C_S0_HiRes_HDF5',
    displayName: 'L1C S0 HiRes Product'
  }, {
    apiValue: 'L1A_Radar_QA',
    displayName: 'L1A Radar Data Quality Information'
  }, {
    apiValue: 'L1B_S0_LoRes_ISO_XML',
    displayName: 'L1B S0 LoRes Metadata'
  }, {
    apiValue: 'L1B_S0_LoRes_QA',
    displayName: 'L1B S0 LoRes Data Quality Information'
  }, {
    apiValue: 'L1B_S0_LoRes_HDF5',
    displayName: 'L1B S0 LoRes Product'
  }, {
    apiValue: 'L1A_Radar_RO_HDF5',
    displayName: 'L1A Radar Receive Only Product'
  }, {
    apiValue: 'L1C_S0_HiRes_ISO_XML',
    displayName: 'L1C S0 HiRes Metadata'
  }, {
    apiValue: 'L1A_Radar_HDF5',
    displayName: 'L1A Radar Product'
  }],
  beamModes: [ 'STD' ],
  polarizations: []
};
