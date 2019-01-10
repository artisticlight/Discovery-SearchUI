import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { Map, View } from 'ol';
import {getCenter} from 'ol/extent.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import WKT from 'ol/format/WKT.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import { OSM, Vector as VectorSource, TileWMS, Layer, XYZ, WMTS } from 'ol/source';
import * as proj from 'ol/proj';
import * as customProj4 from 'ol/proj/proj4';

import proj4 from 'proj4';

import { AppState } from '../../store';
import * as mapStore from '../../store/map';
import { equatorial, antarctic, arctic, MapView } from './views';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapView: MapView;
  private map: Map;
  private polygonLayer: Layer;

  constructor(private store$: Store<AppState>) {
  }

  public epsg(): string {
    return this.mapView.projection.epsg;
  }

  public setLayer(layer: Layer): void {
    if (!!this.polygonLayer) {
      this.map.removeLayer(this.polygonLayer);
    }

    this.polygonLayer = layer;
    this.map.addLayer(this.polygonLayer);
  }

  public equatorial() {
    this.setMap(equatorial());
  }

  public antarctic(): void {
    this.setMap(antarctic());
  }

  public arctic(): void  {
    this.setMap(arctic());
  }

  private setMap(mapView: MapView): void {
    this.mapView = mapView;

    if (!this.map) {
      this.map = this.newMap();

      // this.map.getView().animate({
      //   center: proj.fromLonLat([-0.12755, 51.507222]),
      //   zoom: 4,
      //   duration: 1000
      // });

      this.map.on('moveend', e => {
        const map = e.map;

        const view = map.getView();
        const extent = view.calculateExtent(map.getSize());

        const [lon, lat] = proj.toLonLat(getCenter(extent));
        const zoom = view.getZoom();

        this.store$.dispatch(new mapStore.UpdateMapCenter({lon, lat}));
        this.store$.dispatch(new mapStore.UpdateMapZoom(zoom));
      });
    } else {
      this.map = this.updatedMap();
    }
  }

  private newMap(): Map {
    return new Map({
      layers: [ this.mapView.layer ],
      target: 'map',
      view: this.mapView.view,
      controls: [],
      loadTilesWhileAnimating: true
    });
  }

  private updatedMap(): Map {
    this.map.setView(this.mapView.view);

    this.mapView.layer.setOpacity(1);
    this.map.getLayers().setAt(0, this.mapView.layer);

    return this.map;
  }
}
