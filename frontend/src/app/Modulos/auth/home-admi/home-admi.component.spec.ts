import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAdmiComponent } from './home-admi.component';

describe('HomeAdmiComponent', () => {
  let component: HomeAdmiComponent;
  let fixture: ComponentFixture<HomeAdmiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeAdmiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeAdmiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
