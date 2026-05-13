import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingViajeComponent } from './tracking-viaje.component';

describe('TrackingViajeComponent', () => {
  let component: TrackingViajeComponent;
  let fixture: ComponentFixture<TrackingViajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingViajeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackingViajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
