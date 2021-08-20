import {
  Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy
} from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import {
  map, filter, switchMap, tap,
  withLatestFrom,
  mergeAll,
} from 'rxjs/operators';

import { Vector as VectorLayer} from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';

import tippy, {followCursor} from 'tippy.js';
import { SubSink } from 'subsink';

import { AppState } from '@store';
import * as scenesStore from '@store/scenes';
import * as searchStore from '@store/search';
import * as mapStore from '@store/map';
import * as uiStore from '@store/ui';

import * as models from '@models';
import { MapService, WktService, ScreenSizeService, ScenesService } from '@services';
import * as polygonStyle from '@services/map/polygon.style';
import { SarviewsEvent } from '@models';

enum FullscreenControls {
  MAP = 'Map',
  DRAW = 'Draw',
  NONE = 'None'
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy  {
  @Output() loadUrlState = new EventEmitter<void>();
  @ViewChild('overlay', { static: true }) overlayRef: ElementRef;
  @ViewChild('map', { static: true }) mapRef: ElementRef;

  public drawMode$ = this.store$.select(mapStore.getMapDrawMode);
  public interactionMode$ = this.store$.select(mapStore.getMapInteractionMode);
  public mousePosition$ = this.mapService.mousePosition$;
  public isFiltersMenuOpen: boolean;

  public banners$ = this.store$.select(uiStore.getBanners);

  public view$ = this.store$.select(mapStore.getMapView);
  public areResultsLoaded$ = this.store$.select(scenesStore.getAreProductsLoaded);

  public viewTypes = models.MapViewType;

  public tooltip;
  public overlay: Overlay;
  public currentOverlayPosition;
  public shouldShowOverlay: boolean;
  public isResultsMenuOpen: boolean;

  public fullscreenControl = FullscreenControls.NONE;
  public fc = FullscreenControls;

  private isMapInitialized$ = this.store$.select(mapStore.getIsMapInitialization);
  private viewType$ = combineLatest(
    this.store$.select(mapStore.getMapView),
    this.store$.select(mapStore.getMapLayerType),
  );
  private gridlinesActive$ = this.store$.select(mapStore.getAreGridlinesActive);

  public breakpoint: models.Breakpoints;
  public breakpoints = models.Breakpoints;

  public searchType: models.SearchType;
  public searchTypes = models.SearchType;

  private subs = new SubSink();

  constructor(
    private store$: Store<AppState>,
    private mapService: MapService,
    private wktService: WktService,
    private screenSize: ScreenSizeService,
    private scenesService: ScenesService
  ) {}

  ngOnInit(): void {

    this.subs.add(
      this.screenSize.breakpoint$.subscribe(
        breakpoint => this.breakpoint = breakpoint
      )
    );

    this.subs.add(
      this.store$.select(searchStore.getSearchType).subscribe(
        searchType => this.searchType = searchType
      )
    );

    this.subs.add(
      this.store$.select(uiStore.getIsResultsMenuOpen).subscribe(
        isOpen => this.isResultsMenuOpen = isOpen
      )
    );

    this.subs.add(
      combineLatest(
        this.store$.select(uiStore.getIsResultsMenuOpen),
        this.mapService.searchPolygon$
      ).pipe(
        filter(_ => !!this.overlay),
        map(([isResultsMenuOpen, polygon]) => !isResultsMenuOpen && !!polygon),
      ).subscribe(
        shouldShowOverlay => shouldShowOverlay ?
          this.showOverlay() :
          this.hideOverlay()
      )
    );

    this.subs.add(
      this.interactionMode$.subscribe(
        mode => {
          if (mode === models.MapInteractionModeType.NONE) {
            this.mapService.enableInteractions();
          } else {
            this.mapService.disableInteractions();
          }
        }
      )
    );

    this.tooltip = (<any[]>tippy('#map', {
      content: 'Click to start drawing',
      offset: '15, 0',
      hideOnClick: false,
      placement: 'bottom-end',
      followCursor: true,
      plugins: [followCursor]
    })).pop();

    this.overlay = new Overlay({
      element: this.overlayRef.nativeElement,
    });

    this.updateMapOnViewChange();
    this.redrawSearchPolygonWhenViewChanges();
    this.updateDrawMode();

    this.subs.add(
      this.interactionMode$.subscribe(
        mode => this.mapService.setInteractionMode(mode)
      )
    );

    this.subs.add(
      this.gridlinesActive$.subscribe(
        active => this.mapService.setGridLinesActive(active)
      )
    );

    this.subs.add(
      combineLatest(
        this.mapService.isDrawing$,
        this.drawMode$,
        this.interactionMode$
      ).pipe(
        map(([isDrawing, drawMode, interactionMode]) => {
          if (interactionMode === models.MapInteractionModeType.DRAW) {
            if (drawMode === models.MapDrawModeType.POINT) {
              return 'Click point';
            }

            if (!isDrawing) {
              return 'Click to start drawing';
            }

            if (drawMode === models.MapDrawModeType.BOX) {
              return 'Click to stop drawing';
            } else if (drawMode === models.MapDrawModeType.LINESTRING || drawMode === models.MapDrawModeType.POLYGON) {
              return 'Double click to stop drawing';
            }
          } else if (interactionMode === models.MapInteractionModeType.EDIT) {
            return 'Click and drag on area of interest';
          }
        })
      ).subscribe(
        tip => this.tooltip.setContent(tip)
      )
    );

    this.subs.add(
      this.interactionMode$.pipe(
        map(mode => mode === models.MapInteractionModeType.DRAW),
      ).subscribe(isDrawMode => {
        if (isDrawMode) {
          this.tooltip.enable();
        } else {
          this.tooltip.hide();
          this.tooltip.disable();
        }
      })
    );

    this.subs.add(
      this.mapService.newSelectedScene$.pipe(
        map(sceneId => new scenesStore.SetSelectedScene(sceneId))
      ).subscribe(
        action => this.store$.dispatch(action)
      )
    );

    this.subs.add(
      this.store$.select(uiStore.getIsFiltersMenuOpen).subscribe(
        isOpen => this.isFiltersMenuOpen = isOpen
      )
    );
  }

  public onFileHovered(e): void {
    if (!this.isFiltersMenuOpen && this.searchType === models.SearchType.DATASET) {
      this.store$.dispatch(new uiStore.OpenAOIOptions());
    }
    e.preventDefault();
  }

  public onNewInteractionMode(mode: models.MapInteractionModeType): void {
    this.store$.dispatch(new mapStore.SetMapInteractionMode(mode));
  }

  public onNewSearchPolygon(polygon: string): void {
    const features = this.loadSearchPolygon(polygon);

    this.mapService.zoomToFeature(features);
  }

  public onFileUploadDialogClosed(successful: boolean): void {
    const newMode = successful ?
    models.MapInteractionModeType.EDIT :
    models.MapInteractionModeType.NONE;

    this.onNewInteractionMode(newMode);
  }

  public removeBanner(banner: models.Banner): void {
   this.store$.dispatch(new uiStore.RemoveBanner(banner));
  }

  public enterDrawPopup(): void {
    this.tooltip.hide();
  }

  public leaveDrawPopup(): void {
    this.tooltip.show();
  }

  public onSetEditMode(): void {
    this.store$.dispatch(
      new mapStore.SetMapInteractionMode(models.MapInteractionModeType.EDIT)
    );
  }

  private updateMapOnViewChange(): void {
    this.subs.add(
      this.viewType$.pipe(
        withLatestFrom(this.isMapInitialized$),
        filter(([_, isInit]) => !isInit),
        map(([view, _]) => view)
      ).subscribe(
        ([view, layerType]) => {
          this.setMapWith(<models.MapViewType>view, <models.MapLayerTypes>layerType);
          this.loadUrlState.emit();
          this.store$.dispatch(new mapStore.MapInitialzed());
        }
      )
    );

    const selectedScene$ = this.store$.select(scenesStore.getSelectedScene);

    this.subs.add(
      this.selectedToLayer$(selectedScene$).pipe(
        map(
          (scene: models.CMRProduct) => this.wktService.wktToFeature(
            scene.metadata.polygon,
            this.mapService.epsg()
          )
        ),
      ).subscribe(
        feature => this.mapService.setSelectedFeature(feature)
      )
    );

    const selectedPair$ = this.store$.select(scenesStore.getSelectedPair);

    this.subs.add(
      this.selectedToLayer$(selectedPair$).pipe(
        map(
          (pair: models.CMRProductPair) => pair.map(
            scene => this.wktService.wktToFeature(
              scene.metadata.polygon,
              this.mapService.epsg()
            )
          )
        ),
      ).subscribe(
        features => this.mapService.setSelectedPair(features)
      )
    );
  }

  private selectedToLayer$(selected$) {
    const scenesLayerAfterInitialization$ = this.isMapInitialized$.pipe(
      filter(isMapInitiliazed => isMapInitiliazed),
      switchMap(_ => this.viewType$),
    );

    this.subs.add(
      scenesLayerAfterInitialization$.pipe(
        tap(([view, mapLayerType]) =>
          this.setMapWith(<models.MapViewType>view, <models.MapLayerTypes>mapLayerType)
        ),
        switchMap(_ =>
          [this.scenePolygonsLayer$(this.mapService.epsg()),
          this.sceneSARViewsEventsLayer$(this.mapService.epsg())]
        ),
      ).subscribe(
        layers => layers.forEach(layer => this.mapService.setLayers(layer))
      )
    );


    const selectedAfterInitialization$ = this.isMapInitialized$.pipe(
      filter(isMapInitiliazed => isMapInitiliazed),
      switchMap(_ => this.viewType$),
      switchMap(_ => selected$),
    );

    return selectedAfterInitialization$.pipe(
      tap(scene => !!scene ? this.mapService.clearSelectedScene() : null),
      filter(g => g !== null),
    );
  }
  /*
   * */

  private redrawSearchPolygonWhenViewChanges(): void {
    this.subs.add(
      this.viewType$.pipe(
        withLatestFrom(this.mapService.searchPolygon$),
        map(([_, polygon]) => polygon),
        filter(polygon => !!polygon),
      ).subscribe(
        polygon => this.loadSearchPolygon(polygon)
      )
    );
  }

  private updateDrawMode(): void {
    this.subs.add(
      this.store$.select(mapStore.getMapDrawMode).subscribe(
        mode => this.mapService.setDrawMode(mode)
      )
    );
  }

  private loadSearchPolygon = (polygon: string) => {
    const features = this.wktService.wktToFeature(
      polygon,
      this.mapService.epsg()
    );

    this.mapService.setDrawFeature(features);

    return features;
  }

  private scenePolygonsLayer$(projection: string): Observable<VectorSource> {
    return this.scenesService.scenes$().pipe(
      map(scenes => this.scenesToFeature(scenes, projection)),
      map(features => this.featuresToSource(features))
    );
  }

  private sceneSARViewsEventsLayer$(projection: string): Observable<VectorSource> {
    return combineLatest([this.mapService.quakeEvents$, this.mapService.volcanicEvents$, this.mapService.floodEvents$]).pipe(
      mergeAll(),
      map(events => <SarviewsEvent[]>events),
      map(events => this.sarviewsEventsToFeature(events, projection)),
      map(features => this.featuresToSource(features))
    );
  }

  private scenesToFeature(scenes: models.CMRProduct[], projection: string) {
    const features = scenes
      .map(g => {
        const wkt = g.metadata.polygon;
        const feature = this.wktService.wktToFeature(wkt, projection);
        feature.set('filename', g.id);

        return feature;
      });

    return features;
  }

  private sarviewsEventsToFeature(events: SarviewsEvent[], projection: string) {
    const features = events
      .map(sarviewEvent => {
        const wkt = sarviewEvent.wkt;
        const feature = this.wktService.wktToFeature(wkt, projection);
        feature.set('filename', sarviewEvent.description);

        const polygon = feature.getGeometry().getCoordinates()[0][0].slice(0, 4);

        if(polygon.length === 2) {
          const point = new Point([polygon[0], polygon[1]]);
          feature.set("eventPoint", point);
          feature.setGeometryName("eventPoint");
          return feature;
        }

        const centerLat = (polygon[0][0] + polygon[1][0] + polygon[2][0] + polygon[3][0]) / 4.0;
        const centerLon = (polygon[0][1] + polygon[1][1] + polygon[2][1] + polygon[3][1]) / 4.0;
        const point = new Point([centerLat, centerLon]);


        feature.set("eventPoint", point);
        feature.setGeometryName("eventPoint");

        console.log(feature);
        return feature;
      });


      console.log(features);
      return features;
  }

  private featuresToSource(features): VectorSource {
    const layer = new VectorLayer({
      source: new VectorSource({
        features, wrapX: true
      }),
      style: polygonStyle.scene
    });

    layer.set('selectable', 'true');

    return layer;
  }

  private setMapWith(viewType: models.MapViewType, layerType: models.MapLayerTypes): void {
    this.mapService.setMapView(viewType, layerType, this.overlay);

    this.mapService.setOverlayUpdate(_ => { });
  }

  public showOverlay(): void {
    this.overlay.setPosition(this.currentOverlayPosition);
  }

  public hideOverlay(): void {
    this.overlay.setPosition(undefined);
  }

  public openDrawControl() {
    this.fullscreenControl = FullscreenControls.DRAW;
  }

  public openMapControl() {
    this.fullscreenControl = FullscreenControls.MAP;
  }

  public closeMobileFullscreenControls() {
    this.fullscreenControl = FullscreenControls.NONE;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
