import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import noUiSlider from 'nouislider';
import { Subject,  fromEvent} from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { AppState } from '@store';
import { Store } from '@ngrx/store';
import * as filtersStore from '@store/filters';

import { SubSink } from 'subsink';
import { ScreenSizeService } from '@services';
import * as models from '@models';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

declare var wNumb: any;

@Component({
  selector: 'app-sbas-sliders-two',
  templateUrl: './sbas-sliders-two.component.html',
  styleUrls: ['./sbas-sliders-two.component.scss']
})
export class SbasSlidersTwoComponent implements OnInit {
  @ViewChild('temporalFilter2', { static: true }) temporalFilter: ElementRef;
  @ViewChild('meterInputField', { static: true }) meterFilter: ElementRef;

  public breakpoint$ = this.screenSize.breakpoint$;
  public breakpoint: models.Breakpoints;
  public breakpoints = models.Breakpoints;

  public temporalAutoTicks = false;
  public temporalShowTicks = true;
  public temporalTickInterval = 7;

  public tempSlider;
  public temporal: number;
  public perpendicular: number;
  public days: number;
  public daysValues$ = new Subject<number[]>();
  public metersValues$ = new Subject<number[]>();
  public slider;

  private firstLoad = true;
  private firstMeterLoad = true;
  private subs = new SubSink();

  options: FormGroup;
  colorControl: FormControl;

  meterDistanceControl: FormControl;
  daysControl: FormControl;

  constructor(
    private store$: Store<AppState>,
    private screenSize: ScreenSizeService,
    fb: FormBuilder
  ) {
    this.meterDistanceControl = new FormControl(this.perpendicular, Validators.min(-999));
    this.daysControl = new FormControl(this.days, Validators.min(0));

      this.options = fb.group({
        color: this.colorControl,
        meterDistance: this.meterDistanceControl,
        days: this.daysControl,
    });
  }

  ngOnInit(): void {
    this.colorControl = new FormControl('primary');
    this.meterDistanceControl = new FormControl(this.perpendicular, Validators.min(-999));
    this.daysControl = new FormControl(this.days, Validators.min(0));

    const [tempSlider, daysValues$] = this.makeDaysSlider$(this.temporalFilter);
    this.tempSlider = tempSlider;

    fromEvent(this.meterFilter.nativeElement, 'keyup').pipe(
      map((event: any) => {
        return event.target.value;
      }),
      filter(res => res.length > 0),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((_: number) => {
      this.metersValues$.next([this.perpendicular, null] );
    });

    this.subs.add(
      this.screenSize.breakpoint$.subscribe(breakpoint => this.breakpoint = breakpoint )
    );

    this.subs.add(
      daysValues$.subscribe(
        ([start]) => {
          const action = new filtersStore.SetTemporalRange({ start, end: null });
          this.store$.dispatch(action);
        }
      )
    );

    this.subs.add(
      this.store$.select(filtersStore.getTemporalRange).subscribe(
        temp => {
          this.days = temp.start;
          if (this.firstLoad) {
            this.slider.set([this.days]);
            this.firstLoad = false;
          }
        }
      )
    );

    this.subs.add(
      this.store$.select(filtersStore.getPerpendicularRange).subscribe(
        perp => {
          this.perpendicular = perp.start;
          this.options.controls.meterDistance.setValue(this.perpendicular);
          if (this.firstMeterLoad) {
            this.firstMeterLoad = false;
            if (!perp.start) {
              const action = new filtersStore.SetPerpendicularRange({ start: 300, end: null });
              this.store$.dispatch(action);
            }
          }
        }
      )
    );

    this.subs.add(
      this.metersValues$.subscribe(
        ([start]) => {
          const action = new filtersStore.SetPerpendicularRange({ start, end: null });
          this.store$.dispatch(action);
        }
      )
    );

  }

  public getTemporalSliderTickInterval(): number | 'auto' {
    if (this.temporalShowTicks) {
      return this.temporalAutoTicks ? 'auto' : this.temporalTickInterval;
    }

    return 0;
  }

  public updatePerpendicular() {
    this.options.controls.meterDistance.setValue(this.perpendicular);
    // this.metersValues$.next([this.perpendicular, null] );
    // this.slider.set(this.perpendicular);
  }

  public updateDaysOffset() {
    this.options.controls.days.setValue(this.days);
    this.daysValues$.next([this.days, null] );
    // this.slider.set(this.days);
  }

  private makeDaysSlider$(filterRef: ElementRef) {
    // @ts-ignore
    this.slider = noUiSlider.create(filterRef.nativeElement, {
      orientation: 'horizontal',
      direction: 'ltr',
      start: [48],
      behaviour: 'tap-drag',
      tooltips: false,
      step: 1,
      range: {
        'min': 0,
        'max': 60
      },
      pips: {
        mode: 'positions',
        values: [0, 20, 40, 60, 80, 100],
        density: 4,
        stepped: true,
        format: wNumb({
          decimals: 0,
          suffix: ' days'
        })
      }
    });

    this.slider.on('update', (values, _) => {
      this.daysValues$.next(values.map(v => +v));
    });

    return [
      this.slider,
      this.daysValues$.asObservable().pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
    ];
  }
}
