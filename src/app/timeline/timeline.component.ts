import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface CustomVideoCellType {
  src: string;
  name: string;
  duration: number;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent {
  @Input() timeline: CustomVideoCellType[] = [];
  @Output() updateTimeline = new EventEmitter<CustomVideoCellType[]>();
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;
  title = 'ngx-video-timeline';

  constructor() {}

  drop(event: CdkDragDrop<CustomVideoCellType[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.timeline, event.previousIndex, event.currentIndex);
    } else {
      const dataScene = event.item.element.nativeElement.getAttribute('data-scene');
      if (dataScene) {
        const scene = JSON.parse(dataScene);
        this.timeline = [...this.timeline, scene];
        this.updateTimeline.emit(this.timeline);
      }
    }
  }

  dropExternal(event: DragEvent) {
    event.preventDefault();
    const sceneData = event.dataTransfer?.getData('scene');
    if (sceneData) {
      const scene = JSON.parse(sceneData);
      this.timeline = [...this.timeline, scene]; // Create a new array reference
      this.updateTimeline.emit(this.timeline); // Emit the updated timeline
    }
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }
}
