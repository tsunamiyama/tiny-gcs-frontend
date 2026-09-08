import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatteryPanel } from './battery-panel';

describe('BatteryPanel', () => {
  let component: BatteryPanel;
  let fixture: ComponentFixture<BatteryPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteryPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(BatteryPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
