import { Component, Input } from '@angular/core';

import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { AppState } from '@store';
import * as filtersStore from '@store/filters';

import * as models from '@models';
import { PropertyService } from '@services';

@Component({
  selector: 'app-dataset-search',
  templateUrl: './dataset-search.component.html',
  styleUrls: ['./dataset-search.component.scss']
})

export class DatasetSearchComponent {
  @Input() dataset: models.CMRProduct;

  defaultPanelOpenState = true;
  panelIsDisabled = true;
  customCollapsedHeight = '30px';
  customExpandedHeight = '30px';

  public p = models.Props;
  public missionsByDataset$ = this.store$.select(filtersStore.getMissionsByDataset);
  public selectedMission$ = this.store$.select(filtersStore.getSelectedMission);
  public missionDatasets$ = this.missionsByDataset$.pipe(
    map(missions => Object.keys(missions))
  );
  public dataset$ = this.store$.select(filtersStore.getSelectedDataset);

  constructor(
    public prop: PropertyService,
    private store$: Store<AppState>
  ) {}

  public onNewMissionSelected(selectedMission: string): void {
    this.store$.dispatch(new filtersStore.SelectMission(selectedMission));
  }
}