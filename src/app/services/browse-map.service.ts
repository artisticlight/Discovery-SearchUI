import { Injectable } from '@angular/core';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
// import { Extent } from 'ol/extent.js';
// import ImageLayer from 'ol/layer/Image.js';
import ImageLayer from 'ol/layer/Image';
import * as polygonStyle from './map/polygon.style';
// import { Projection as VProjection } from '@services/map/views/map-view';
// import Projection from 'ol/proj/Projection.js';

// import * as proj from 'ol/proj';
import Static from 'ol/source/ImageStatic.js';
import { XYZ } from 'ol/source';
import { mapOptions } from '@models';
import TileLayer from 'ol/layer/Tile';
import { Layer, Vector } from 'ol/layer';
// import { WktService } from '@services';
import Polygon from 'ol/geom/Polygon';
import {
  // applyTransform,
  Extent, getCenter } from 'ol/extent';
import VectorSource from 'ol/source/Vector';
import WKT from 'ol/format/WKT';
// import { Feature } from 'ol';
// import { transformExtent } from 'ol/proj';

interface Dimension {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class BrowseMapService {
  private map: Map;
  private view: View;


  // constructor(private wktService: WktService) { }

  public setBrowse(browse: string, dim: Dimension, wkt: string = ''): void {
    // coordinates = [0, 0];
    // const browse_extent: Extent = [coordinates[0], coordinates[1], dim.width, dim.height];
    // const projection = new VProjection('EPSG:3857');

    // const feature = this.wktService.wktToFeature(wkt, 'EPSG:3857');
    const format = new WKT();
    const feature = format.readFeature(wkt, {dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'});
    const polygon: Polygon = feature.getGeometry() as Polygon;
    polygon.setCoordinates(polygon.getCoordinates().map(coord => coord.reverse()));
    // const feature = new Feature(geom);
    // feature.getGeometry().scale(-1, 0, )

    // polygon.translate(0, -dim);

    const coordinates = polygon.getCoordinates();
    console.log(polygon);

    const c = coordinates[0];
    // const ex = boundingExtent(c);

    // const imageExtent = proj.transformExtent(ex, 'EPSG:3857', projection.epsg);
    const imageExtent = [ Math.min( c[0][0], c[1][0], c[2][0], c[3][0] ),
                 Math.min( c[0][1], c[1][1], c[2][1], c[3][1] ),
                 Math.max( c[0][0], c[1][0], c[2][0], c[3][0] ),
                 Math.max( c[0][1], c[1][1], c[2][1], c[3][1] )] as Extent;

    console.log(imageExtent);

    const polygonVectorSource = new VectorSource({
      features: [feature],
      wrapX: mapOptions.wrapX
    })
    const imagePolygonLayer = new Vector({
      source: polygonVectorSource,
      style: polygonStyle.valid,
      // extent: imageExtent
    })
    // applyTransform(imageExtent,  old => [old[0], old[1], old[2], old[3]])
    console.log(dim);

    // console.log(projection);
    // const extent = proj.transformExtent(
    //   [-Number.MAX_VALUE, -90, Number.MAX_VALUE, 90],
    //   'EPSG:4326', projection.epsg
    // )

    // const coord = proj.fromLonLat(coordinates, projection.epsg);
    // console.log(coord);
    // const browse_projection = new Projection({
    //   code: 'scene-browse',
    //   // units: 'pixels',
    //   // extent: browse_extent
    // });

    const coord = getCenter( polygon.getExtent());

    const layer = new ImageLayer({
      source: new Static({
        url: browse,
        imageExtent: polygon.getExtent(),
        // projection: 'EPSG:4326',
        // imageSize: [dim.width, dim.height]
      }),
    });

    const mapSource = new XYZ({
      url : `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=bFwkahiCrAA0526OlsHS`,
      wrapX: mapOptions.wrapX,
      tileSize: [512, 512]
    });

    const map_layer = new TileLayer({ source: mapSource });
    console.log(map_layer);

    if(!this.map) {
    this.view = new View({
      projection: 'EPSG:3857',
      center: coord,
      zoom: 4,
      minZoom: 1,
      maxZoom: 8,
    });
  }

    console.log(map_layer);
    if (this.map) {
      this.update(this.view, [map_layer, imagePolygonLayer, layer]);
    } else {
      this.map = this.newMap(this.view, [map_layer, imagePolygonLayer, layer]);
    }
  }

  private update(view: View, layer: Layer[]): void {
    this.map.setView(view);
    const mapLayers = this.map.getLayers();
    layer.forEach((layer, idx) => mapLayers.setAt(idx + 1, layer));
    // mapLayers.setAt(0, layer);
  }

  private newMap(view: View, layer: Layer[]): Map {
    return new Map({
      layers: layer ,
      target: 'browse-map',
      view
    });
  }

  cleanup(): void {
    this.map = null;
  }
}
