import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateLayoutsComponent } from './private-layouts.component';

describe('PrivateLayoutsComponent', () => {
  let component: PrivateLayoutsComponent;
  let fixture: ComponentFixture<PrivateLayoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateLayoutsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateLayoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
