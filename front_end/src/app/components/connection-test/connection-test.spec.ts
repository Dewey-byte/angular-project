import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionTest } from './connection-test';

describe('ConnectionTest', () => {
  let component: ConnectionTest;
  let fixture: ComponentFixture<ConnectionTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
