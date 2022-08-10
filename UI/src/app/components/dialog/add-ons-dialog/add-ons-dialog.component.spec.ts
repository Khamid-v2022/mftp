import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnsDialogComponent } from './add-ons-dialog.component';

describe('AddOnsDialogComponent', () => {
  let component: AddOnsDialogComponent;
  let fixture: ComponentFixture<AddOnsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOnsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
