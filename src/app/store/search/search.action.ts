import { Action } from '@ngrx/store';

import { Sentinel1Product } from '@models';

export enum SearchActionType {
  MAKE_SEARCH = '[Search] Make A Search',
  SEARCH_RESPONSE = '[Search] Search Response',
  SEARCH_ERROR = '[Search] Search Error',
  CANCEL_SEARCH = '[Search] Cancel Search',
  SEARCH_CANCELED = '[Search] Search Canceled',
}

export class MakeSearch implements Action {
  public readonly type = SearchActionType.MAKE_SEARCH;
}

export class CancelSearch implements Action {
  public readonly type = SearchActionType.CANCEL_SEARCH;
}

export class SearchCanceled implements Action {
  public readonly type = SearchActionType.SEARCH_CANCELED;
}

export class SearchResponse implements Action {
  public readonly type = SearchActionType.SEARCH_RESPONSE;

  constructor(public payload: Sentinel1Product[]) {}
}

export class SearchError implements Action {
  public readonly type = SearchActionType.SEARCH_ERROR;

  constructor(public payload: string) {}
}

export type SearchActions =
  | MakeSearch
  | CancelSearch
  | SearchError
  | SearchResponse;