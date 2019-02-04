import { Injectable } from '@angular/core';

import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { AppState } from '../app.reducer';
import * as filtersAction from './filters.action';
import * as filtersReducer from './filters.reducer';

@Injectable()
export class FiltersEffects {

  constructor(
    private store$: Store<AppState>,
    private actions$: Actions) {}

  @Effect() updateDateRangeWithNewPlatform$: Observable<Action> = this.actions$.pipe(
    ofType<filtersAction.AddSelectedPlatform>(filtersAction.FiltersActionType.ADD_SELECTED_PLATFORM),
    map(action => new filtersAction.ClearDateRange())
  );

  @Effect() updateDateRangeOnPlatformRemoved$: Observable<Action> = this.actions$.pipe(
    ofType<filtersAction.RemoveSelectedPlatform>(filtersAction.FiltersActionType.REMOVE_SELECTED_PLATFORM),
    map(action => new filtersAction.ClearDateRange())
  );
}
