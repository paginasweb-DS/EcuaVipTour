import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperacionViajeComponent } from './operacion-viaje.component';

describe('OperacionViajeComponent', () => {
  let component: OperacionViajeComponent;
  let fixture: ComponentFixture<OperacionViajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperacionViajeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OperacionViajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
