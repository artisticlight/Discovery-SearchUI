import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ListSearchType } from '@models';

import { map, tap } from 'rxjs/operators';

import { Store } from '@ngrx/store';

import { AppState } from '@store';
import * as filtersStore from '@store/filters';
import * as granulesStore from '@store/granules';

import * as models from '@models';

@Component({
  selector: 'app-list-search',
  templateUrl: './list-search.component.html',
  styleUrls: ['./list-search.component.css']
})
export class ListSearchComponent implements OnInit {
  public listSearchMode$ = this.store$.select(filtersStore.getListSearchMode);
  public types = ListSearchType;

  public searchList: string;
  private searchList$ = this.store$.select(granulesStore.getSearchList).pipe(
      map(list => this.searchList = list.join('\n'))
    ).subscribe(_ => _);

  constructor(
    private store$: Store<AppState>,
  ) {}

  ngOnInit() {
  }

  public onGranuleModeSelected(): void {
    this.onNewListSearchMode(ListSearchType.GRANULE);
  }

  public onProductModeSelected(): void {
    this.onNewListSearchMode(ListSearchType.PRODUCT);
  }

  public onTextInputChange(text: string): void {
    const granules = text
      .split(/[\s\n,\t]+/)
      .filter(v => v);

    const unique = Array.from(new Set(granules));

    this.store$.dispatch(new granulesStore.SetSearchList(granules));
  }

  public onNewListSearchMode(mode: models.ListSearchType): void {
    this.store$.dispatch(new filtersStore.SetListSearchType(mode));
  }
}
