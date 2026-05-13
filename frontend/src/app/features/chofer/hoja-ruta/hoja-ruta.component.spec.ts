import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HojaRutaComponent } from './hoja-ruta.component';

describe('HojaRutaComponent', () => {
  let component: HojaRutaComponent;
  let fixture: ComponentFixture<HojaRutaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HojaRutaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaRutaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
