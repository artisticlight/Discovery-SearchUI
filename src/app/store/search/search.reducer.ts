import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SearchActionType, SearchActions } from './search.action';


export interface SearchState {
  isLoading: boolean;
  error: null | string;
  isCanceled: boolean;
}

export const initState: SearchState = {
  isLoading: false,
  error: null,
  isCanceled: false,
};

export function searchReducer(state = initState, action: SearchActions): SearchState {
  switch (action.type) {
    case SearchActionType.MAKE_SEARCH: {
      return {
        ...state,
        error: null,
        isLoading: true,
        isCanceled: false,
      };
    }

    case SearchActionType.CANCEL_SEARCH: {
      return {
        ...state,
        isLoading: false,
        isCanceled: true,
      };
    }

    case SearchActionType.SEARCH_RESPONSE: {
      return {
        ...state,
        isLoading: false,
        isCanceled: false,
      };
    }

    case SearchActionType.SEARCH_ERROR: {
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    }

    default: {
      return state;
    }
  }
}

export const getSearchState = createFeatureSelector<SearchState>('search');

export const getIsLoading = createSelector(
  getSearchState,
  (state: SearchState) => state.isLoading
);

export const getSearchError = createSelector(
  getSearchState,
  (state: SearchState) => state.error
);

export const getIsCanceled = createSelector(
  getSearchState,
  (state: SearchState) => state.isCanceled
);