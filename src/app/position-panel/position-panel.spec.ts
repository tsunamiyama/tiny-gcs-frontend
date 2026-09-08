import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PositionPanel } from './position-panel';

describe('PositionPanel', () => {
  let component: PositionPanel;
  let fixture: ComponentFixture<PositionPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(PositionPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
