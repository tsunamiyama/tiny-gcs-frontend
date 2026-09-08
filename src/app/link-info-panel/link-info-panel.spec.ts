import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkInfoPanel } from './link-info-panel';

describe('LinkInfoPanel', () => {
  let component: LinkInfoPanel;
  let fixture: ComponentFixture<LinkInfoPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkInfoPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkInfoPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
