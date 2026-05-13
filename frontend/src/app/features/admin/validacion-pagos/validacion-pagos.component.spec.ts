import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidacionPagosComponent } from './validacion-pagos.component';

describe('ValidacionPagosComponent', () => {
  let component: ValidacionPagosComponent;
  let fixture: ComponentFixture<ValidacionPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidacionPagosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidacionPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
