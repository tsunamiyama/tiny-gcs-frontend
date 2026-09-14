import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandsPanel } from './commands-panel';

describe('CommandsPanel', () => {
  let component: CommandsPanel;
  let fixture: ComponentFixture<CommandsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandsPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandsPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
