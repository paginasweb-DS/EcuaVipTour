import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaPagoComponent } from './reserva-pago.component';

describe('ReservaPagoComponent', () => {
  let component: ReservaPagoComponent;
  let fixture: ComponentFixture<ReservaPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaPagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReservaPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
