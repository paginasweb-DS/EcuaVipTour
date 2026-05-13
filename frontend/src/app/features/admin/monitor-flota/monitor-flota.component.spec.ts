import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorFlotaComponent } from './monitor-flota.component';

describe('MonitorFlotaComponent', () => {
  let component: MonitorFlotaComponent;
  let fixture: ComponentFixture<MonitorFlotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorFlotaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonitorFlotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
