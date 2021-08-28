import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SarviewsFiltersComponent } from './sarviews-filters.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SarviewsEventSearchSelectorModule } from '@components/shared/selectors/sarviews-event-search-selector';
import { SarviewsEventTypeSelectorModule } from '@components/shared/selectors/sarviews-event-type-selector';
import { DateSelectorModule } from '@components/shared/selectors/date-selector';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    SarviewsFiltersComponent
  ],
  imports: [
    CommonModule,
    MatExpansionModule,
    SarviewsEventSearchSelectorModule,
    SarviewsEventTypeSelectorModule,
    DateSelectorModule,
    MatIconModule,
  ],
  exports: [
    SarviewsFiltersComponent
  ]
})
export class SarviewsFiltersModule { }
