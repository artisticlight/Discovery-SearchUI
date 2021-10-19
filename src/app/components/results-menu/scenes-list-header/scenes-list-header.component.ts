import { Component, OnDestroy, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';

import { combineLatest } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { AppState } from '@store';
import * as scenesStore from '@store/scenes';
import * as uiStore from '@store/ui';
import * as queueStore from '@store/queue';
import * as searchStore from '@store/search';
import * as filtersStore from '@store/filters';

import {
  MapService, ScenesService, ScreenSizeService,
  PairService, Hyp3Service
} from '@services';

import * as models from '@models';
import { SubSink } from 'subsink';
import { CMRProductMetadata, hyp3JobTypes, SarviewsProduct } from '@models';
import * as moment from 'moment';
import { AddItems } from '@store/queue';
import { MakeEventProductCMRSearch } from '@store/search';

@Component({
  selector: 'app-scenes-list-header',
  templateUrl: './scenes-list-header.component.html',
  styleUrls: ['./scenes-list-header.component.scss']
})
export class ScenesListHeaderComponent implements OnInit, OnDestroy {
  public totalResultCount$ = this.store$.select(searchStore.getTotalResultCount);
  public numberOfScenes$ = this.store$.select(scenesStore.getNumberOfScenes);
  public numberOfProducts$ = this.store$.select(scenesStore.getNumberOfProducts);
  public numberOfFilteredEvents$ = this.scenesService.sarviewsEvents$().pipe(
    filter(events => !!events),
    map(events => events.length));
  public numSarviewsScenes$ = this.store$.select(scenesStore.getNumberOfSarviewsEvents);
  public products = [];
  public downloadableProds = [];
  public sarviewsEventProducts: SarviewsProduct[] = [];
  public pinnedEventIDs: string[];

  public numBaselineScenes$ = this.scenesService.scenes$().pipe(
    map(scenes => scenes.length),
  );
  public numPairs$ = this.pairService.pairs$().pipe(
    map(pairs => pairs.pairs.length + pairs.custom.length)
  );


  public selectedEventProducts$ = this.store$.select(scenesStore.getPinnedEventBrowseIDs).pipe(
    map(browseIds =>
      this.sarviewsEventProducts.filter(prod => browseIds.includes(prod.product_id)))
  );

  public pairs: models.CMRProductPair[];
  public sbasProducts: models.CMRProduct[] = [];
  public queuedProducts: models.CMRProduct[];
  public canHideRawData: boolean;
  public showS1RawData: boolean;

  public canHideExpiredData: boolean;
  public showExpiredData: boolean;

  public temporalSort: models.ColumnSortDirection;
  public perpendicularSort: models.ColumnSortDirection;
  public SortDirection = models.ColumnSortDirection;

  public searchType: models.SearchType;
  public SearchTypes = models.SearchType;
  public breakpoint$ = this.screenSize.breakpoint$;
  public breakpoints = models.Breakpoints;
  public ApiFormat = models.AsfApiOutputFormat;

  private subs = new SubSink();

  public RTC = models.hyp3JobTypes.RTC_GAMMA;
  public InSAR = models.hyp3JobTypes.INSAR_GAMMA;
  public AutoRift = models.hyp3JobTypes.AUTORIFT;

  public hyp3able = { total: 0, byJobType: [] };

  constructor(
    private store$: Store<AppState>,
    private mapService: MapService,
    private scenesService: ScenesService,
    private pairService: PairService,
    private screenSize: ScreenSizeService,
    private hyp3: Hyp3Service,
  ) { }

  ngOnInit() {
    this.subs.add(
       this.pairService.productsFromPairs$().subscribe(
         products => this.sbasProducts = products
       )
    );

    this.subs.add(
      combineLatest(
        this.scenesService.products$(),
        this.pairService.pairs$()
      ).subscribe(
        ([products, {pairs, custom}]) => {
          this.products = products;
          this.downloadableProds = this.hyp3.downloadable(products);
          this.pairs = [ ...pairs, ...custom ];

          this.hyp3able = this.hyp3.getHyp3ableProducts([
            ...this.products.map(prod => [prod]),
            ...this.pairs
          ]);
        }
      )
    );

    this.subs.add(
      combineLatest(
        this.scenesService.scenes$(),
        this.store$.select(filtersStore.getProductTypes),
        this.store$.select(searchStore.getSearchType),
      ).pipe(
        debounceTime(250)
      ).subscribe(([scenes, productTypes, searchType]) => {
        this.canHideRawData =
          searchType === models.SearchType.DATASET &&
          scenes.every(scene => scene.dataset === 'Sentinel-1B' || scene.dataset === 'Sentinel-1A') &&
          productTypes.length <= 0;
      })
    );

    this.subs.add(
      this.store$.select(searchStore.getSearchType).subscribe(
        searchType => this.canHideExpiredData = searchType === models.SearchType.CUSTOM_PRODUCTS
      )
    );

    this.subs.add(
      this.store$.select(searchStore.getSearchType).subscribe(
        searchType => this.searchType = searchType
      )
    );

    this.subs.add(
      this.store$.select(scenesStore.getTemporalSortDirection).subscribe(
        temporalSort => this.temporalSort = temporalSort
      )
    );

    this.subs.add(
      this.store$.select(scenesStore.getPerpendicularSortDirection).subscribe(
        perpSort => this.perpendicularSort = perpSort
      )
    );

    this.subs.add(
      this.store$.select(uiStore.getShowS1RawData).subscribe(
        showS1RawData => this.showS1RawData = showS1RawData
      )
    );

    this.subs.add(
      this.store$.select(uiStore.getShowExpiredData).subscribe(
        showExpiredData => this.showExpiredData = showExpiredData
      )
    );

    this.subs.add(
      this.store$.select(queueStore.getQueuedProducts).subscribe(
        products => this.queuedProducts = products
        )
    );

    this.subs.add(
      this.store$.select(scenesStore.getSelectedSarviewsEventProducts).subscribe(
        products => this.sarviewsEventProducts = products
      )
    );

    this.subs.add(
      this.store$.select(scenesStore.getPinnedEventBrowseIDs).subscribe(
        ids => this.pinnedEventIDs = ids
      )
    );
  }

  public onZoomToResults(): void {
    this.mapService.zoomToResults();
  }

  public onToggleS1RawData(): void {
    this.store$.dispatch(
      this.showS1RawData ?
        new uiStore.HideS1RawData() :
        new uiStore.ShowS1RawData()
    );
  }

  public onToggleExpiredData(): void {
    this.store$.dispatch(
      this.showExpiredData ?
        new uiStore.HideExpiredData() :
        new uiStore.ShowExpiredData()
    );
  }

  public onTogglePerpendicularSort(): void {
    const direction = this.oppositeDirection(this.perpendicularSort);

    this.store$.dispatch(new scenesStore.SetTemporalSortDirection(models.ColumnSortDirection.NONE));
    this.store$.dispatch(new scenesStore.SetPerpendicularSortDirection(direction));
  }

  public onToggleTemporalSort(): void {
    const direction = this.oppositeDirection(this.temporalSort);

    this.store$.dispatch(new scenesStore.SetPerpendicularSortDirection(models.ColumnSortDirection.NONE));
    this.store$.dispatch(new scenesStore.SetTemporalSortDirection(direction));
  }

  private oppositeDirection(currentDir: models.ColumnSortDirection): models.ColumnSortDirection {
    let direction = models.ColumnSortDirection.INCREASING;

    if (currentDir === models.ColumnSortDirection.INCREASING) {
      direction = models.ColumnSortDirection.DECREASING;
    } else if (currentDir === models.ColumnSortDirection.DECREASING) {
      direction = models.ColumnSortDirection.INCREASING;
    }

    return direction;
  }

  public queueAllProducts(products: models.CMRProduct[]): void {
    if (this.searchType === models.SearchType.CUSTOM_PRODUCTS) {
      products = this.hyp3.downloadable(products);
    }

    this.store$.dispatch(new queueStore.AddItems(products));
  }

  public queueSBASProducts(products: models.CMRProduct[]): void {
    this.store$.dispatch(new queueStore.AddItems(products));
  }

  public onDownloadPairCSV() {
    const pairRows = this.pairs
      .map(([reference, secondary]) => {

        const temp = Math.abs(reference.metadata.temporal - secondary.metadata.temporal);

        return (
          `${reference.name},${reference.downloadUrl},${reference.metadata.perpendicular},` +
          `${secondary.name},${secondary.downloadUrl},${secondary.metadata.perpendicular},${temp}`
        );
      })
      .join('\n');

    const pairsCSV =
      `Reference, Reference URL, Reference Perpendicular Baseline (meters),` +
      `Secondary, Secondary URL, Secondary Perpendicular Baseline (meters),` +
      `Pair Temporal Baseline (days)\n${pairRows}`;

    const blob = new Blob([pairsCSV], {
      type: 'text/csv;charset=utf-8;',
    });
    saveAs(blob, 'asf-sbas-pairs.csv');
  }

  public formatNumber(num: number): string {
    return (num || 0)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  public onMakeDownloadScript(products: models.CMRProduct[]): void {
    this.store$.dispatch(new queueStore.MakeDownloadScriptFromList(products));
  }

  public onMakeSarviewsProductDownloadScript(products: models.SarviewsProduct[]): void {
    this.store$.dispatch(new queueStore.MakeDownloadScriptFromSarviewsProducts(products));
  }

  public onQueuePinnedSarviewsProducts(): void {
    const pinned = this.sarviewsEventProducts.filter(prod =>
      this.pinnedEventIDs.includes(prod.product_id)
    );

    this.onQueueSarviewsProducts(pinned);
  }

  public onQueueSarviewsProducts(products: models.SarviewsProduct[]): void {
    const jobTypes = Object.values(hyp3JobTypes);
    const toCMRProducts: models.CMRProduct[] = products.map(
      prod => {

        const job = jobTypes.find(t => t.id === prod.job_type);
        const productTypeDisplay = `${job.name}, ${job.productTypes[0].productTypes[0]}`;
        const output: models.CMRProduct = {
          name: prod.files.product_name,
          productTypeDisplay,
          file: '',
          id: prod.product_id,
          downloadUrl: prod.files.product_url,
          bytes: prod.files.product_size,
          browses: [prod.files.browse_url],
          thumbnail: prod.files.thumbnail_url,
          dataset: 'Sentinel-1',
          groupId: 'SARViews',
          isUnzippedFile: false,

          metadata: {
            date: moment(prod.processing_date),
            stopDate: moment(prod.processing_date),
            polygon: prod.granules[0].wkt,
            productType: job.name,

          } as CMRProductMetadata
        };

        return output;

      }
    );
    this.store$.dispatch(new AddItems(toCMRProducts));
  }

  public addOnDemandEventProducts(targetProducts: SarviewsProduct[]) {
    this.store$.dispatch(new MakeEventProductCMRSearch(targetProducts));
  }

  public addOnDemandEventProductsBySearchType(jobType: models.Hyp3JobType) {
    this.addOnDemandEventProducts(this.EventMonitoringByJobType(jobType));
  }

  public EventMonitoringByJobType(jobType: models.Hyp3JobType) {
    const targetProducts = this.sarviewsEventProducts.filter(product => hyp3JobTypes[product.job_type] === jobType);
    return targetProducts;
  }

  public onMetadataExport(format: models.AsfApiOutputFormat): void {
    const action = new queueStore.DownloadSearchtypeMetadata(format);

    if (this.searchType === this.SearchTypes.BASELINE) {
      this.store$.dispatch(action);
    }
  }

  public onOpenHelp(infoUrl) {
    window.open(infoUrl);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
