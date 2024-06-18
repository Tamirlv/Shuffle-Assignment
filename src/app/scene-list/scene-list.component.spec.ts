import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneListComponent } from './scene-list.component';

describe('SceneListComponent', () => {
  let component: SceneListComponent;
  let fixture: ComponentFixture<SceneListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SceneListComponent]
    });
    fixture = TestBed.createComponent(SceneListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
