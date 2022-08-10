import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChmodDialogComponent } from './chmod-dialog.component';

describe('ChmodDialogComponent', () => {
  let component: ChmodDialogComponent;
  let fixture: ComponentFixture<ChmodDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChmodDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChmodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
