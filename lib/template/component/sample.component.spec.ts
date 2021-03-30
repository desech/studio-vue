import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CLASSNAMEComponent } from './FILENAME.component';

describe('CLASSNAMEComponent', () => {
  let component: CLASSNAMEComponent;
  let fixture: ComponentFixture<CLASSNAMEComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CLASSNAMEComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CLASSNAMEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
