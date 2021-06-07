import { sentinel_1 } from './dataset.model';
import { Hyp3JobType, JobOptionType } from './hyp3-job-type.model';

export const RtcGammaJobType: Hyp3JobType = {
  id: 'RTC_GAMMA',
  name: 'RTC GAMMA',
  infoUrl: 'https://hyp3-docs.asf.alaska.edu/products/#rtc',
  description: `
    Radiometric Terrain Correction (RTC) removes geometric and radiometric
    distortions in SAR datasets and creates analysis-ready data suitable for use
    in GIS applications.
  `,
  numProducts: 1,
  productTypes: [{
    dataset: sentinel_1,
    productTypes: [
      'SLC', 'GRD_HD', 'GRD_HS'
    ],
    beamModes: ['IW'],
    polarizations: [
      'VV+VH', 'HH+HV', 'VV', 'HH',
    ]
  }],
  options: [{
    name: 'Radiometry',
    apiName: 'radiometry',
    type: JobOptionType.DROPDOWN,
    options: [{
      name: 'gamma0',
      apiValue: 'gamma0'
    }, {
      name: 'sigma0',
      apiValue: 'sigma0'
    }],
    default: 'gamma0',
    info: `
      Backscatter coefficient normalization, either by ground area
      (sigma0) or illuminated area projected into the look direction (gamma0).
    `
  }, {
    name: 'Scale',
    apiName: 'scale',
    type: JobOptionType.DROPDOWN,
    options: [{
      name: 'power',
      apiValue: 'power'
    }, {
      name: 'amplitude',
      apiValue: 'amplitude'
    }],
    default: 'power',
    info: `Scale of output image; either power or amplitude.`
  }, {
    name: 'DEM Name',
    apiName: 'dem_name',
    type: JobOptionType.DROPDOWN,
    options: [{
      name: 'Copernicus DEM',
      apiValue: 'copernicus'
    }, {
      name: 'NED/SRTM',
      apiValue: 'legacy'
    }],
    default: 'copernicus',
    info: `
      Name of the DEM to use for processing. copernicus will use the Copernicus
      GLO-30 Public DEM, while legacy will use the DEM with the best coverage
      from ASF's legacy SRTM/NED datasets.
    `
  }, {
    name: 'DEM Matching',
    apiName: 'dem_matching',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `
      Coregisters SAR data to the DEM, rather than using
      dead reckoning based on orbit files.
    `
  }, {
    name: 'Include DEM',
    apiName: 'include_dem',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `Include the DEM file in the product package.`
  }, {
    name: 'Include Inc. Angle Map',
    apiName: 'include_inc_map',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `Include the incidence angle map in the product package.`
  }, {
    name: 'Include Scattering Area',
    apiName: 'include_scattering_area',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `Include the scattering area in the product package.`
  }, {
    name: 'Include RGB',
    apiName: 'include_rgb',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `
      Include a false-color RGB decomposition in the product
      package for dual-pol granules (ignored for single-pol granules).
    `
  }, {
    name: 'Speckle Filter',
    apiName: 'speckle_filter',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `Apply an Enhanced Lee speckle filter.`
  }]
};

export const InsarGammaJobType: Hyp3JobType = {
  id: 'INSAR_GAMMA',
  name: 'InSAR GAMMA',
  infoUrl: 'https://hyp3-docs.asf.alaska.edu/products/#insar',
  description: `
    Interferometric Synthetic Aperture Radar (InSAR) processing uses two SAR images
    collected over the same area to determine geometric properties of the surface.
    The phase measurements of the two images acquired at different times are differenced
    to detect and quantify surface changes.
  `,
  numProducts: 2,
  productTypes: [{
    dataset: sentinel_1,
    productTypes: [
      'SLC',
    ],
    beamModes: ['IW'],
    polarizations: [
      'VV+VH', 'HH+HV', 'VV', 'HH',
    ]
  }],
  options: [{
    name: 'Looks',
    apiName: 'looks',
    type: JobOptionType.DROPDOWN,
    options: [{
      name: '20x4',
      apiValue: '20x4'
    }, {
      name: '10x2',
      apiValue: '10x2'
    }],
    default: '20x4',
    info: `Number of looks to take in range and azimuth.`
  }, {
    name: 'Include DEM',
    apiName: 'include_dem',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `
      Include the DEM file in the product package.
    `
  }, {
    name: 'Include Inc. Angle Map',
    apiName: 'include_inc_map',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `
      Include the incidence angle map in the product package.
    `
  }, {
    name: 'Include Look Vectors',
    apiName: 'include_look_vectors',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `
      Include the look vector theta and phi files in the product package.
    `
  }, {
    name: 'Include LOS Displacement',
    apiName: 'include_los_displacement',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `
      Include a GeoTIFF in the product package containing displacement
      values along the Line-Of-Sight (LOS).
    `
  }, {
    name: 'Include Wrapped Phase',
    apiName: 'include_wrapped_phase',
    type: JobOptionType.TOGGLE,
    default: false,
    info: `
      Include the wrapped phase GeoTIFF in the product package.
    `
  }]
};

export const AutoRift: Hyp3JobType = {
  id: 'AUTORIFT',
  name: 'autoRIFT',
  infoUrl: 'https://hyp3-docs.asf.alaska.edu/products/#autorift',
  description: `
    autoRIFT is a highly accurate and efficeint algorithm for finding the pixel
    displacement between two radar images.
  `,
  numProducts: 2,
  productTypes: [{
    dataset: sentinel_1,
    productTypes: [
      'SLC', 'GRD_HD', 'GRD_HS'
    ],
    beamModes: ['IW'],
    polarizations: [
      'VV+VH', 'HH+HV', 'VV', 'HH',
    ]
  }],
  options: []
};

export const hyp3JobTypes = {
  RTC_GAMMA: RtcGammaJobType,
  INSAR_GAMMA: InsarGammaJobType,
  AUTORIFT: AutoRift
};

export const hyp3JobTypesList = Object.values(hyp3JobTypes);
export const hyp3DefaultJobOptions = hyp3JobTypesList.reduce((options, jobType) => {
  jobType.options.forEach(
    option => options[option.apiName] = option.default
  );
  return options;
}, {});
export const hyp3JobOptionsByName = hyp3JobTypesList.reduce((options, jobType) => {
  jobType.options.forEach(
    option => options[option.apiName] = option
  );
  return options;
}, {});
export const hyp3JobOptionsOrdered = hyp3JobTypesList.reduce(
  (options, jobType) => [...options, ...jobType.options]
 , []);
