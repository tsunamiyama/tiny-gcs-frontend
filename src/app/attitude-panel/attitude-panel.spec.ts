import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttitudePanel } from './attitude-panel';

describe('AttitudePanel', () => {
  let component: AttitudePanel;
  let fixture: ComponentFixture<AttitudePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttitudePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AttitudePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
