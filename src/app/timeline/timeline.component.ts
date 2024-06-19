import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Interface defining the structure of a video cell
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

  @Input() timeline: CustomVideoCellType[] = []; // Input property to receive the timeline data from the parent component
  @Input() isPlaying: boolean = false; // Input property to receive the playing status from the preview component
  @Output() updateTimeline = new EventEmitter<CustomVideoCellType[]>(); // Output event emitter to notify the parent component about updates to the timeline
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>; // Reference to the video player element in the template

  // Handle the drop event within the timeline to reorder items or add new ones
  drop(event: CdkDragDrop<CustomVideoCellType[]>) {
    if (this.isPlaying) return; // Prevent changes if the preview is playing

    if (event.previousContainer === event.container) {
      // Reorder items within the timeline and create a new reference
      const updatedTimeline = [...this.timeline];
      moveItemInArray(updatedTimeline, event.previousIndex, event.currentIndex);
      this.timeline = updatedTimeline;
      this.updateTimeline.emit(this.timeline);
    } else {
      // Add a new scene to the timeline
      const dataScene = event.item.element.nativeElement.getAttribute('data-scene');
      if (dataScene) {
        const scene = JSON.parse(dataScene);
        this.timeline = [...this.timeline, scene];
        this.updateTimeline.emit(this.timeline);
      }
    }
  }

  // Handle the external drop event to add new scenes
  dropExternal(event: DragEvent) {
    if (this.isPlaying) return; // Prevent changes if the preview is playing

    event.preventDefault();
    const sceneData = event.dataTransfer?.getData('scene');
    if (sceneData) {
      const scene = JSON.parse(sceneData);
      this.timeline = [...this.timeline, scene];
      this.updateTimeline.emit(this.timeline);
    }
  }

  // Allow drop event to enable drag and drop functionality
  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  // Remove a scene from the timeline
  removeScene(index: number) {
    if (this.isPlaying) return; // Prevent changes if the preview is playing

    const updatedTimeline = [...this.timeline];
    updatedTimeline.splice(index, 1);
    this.timeline = updatedTimeline;
    this.updateTimeline.emit(this.timeline);
  }
}
