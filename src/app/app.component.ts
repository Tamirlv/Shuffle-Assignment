// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  timeline: any[] = []; // Holds the timeline data
  isPlaying: boolean = false; // Holds the playing status

  // Updates the timeline with new data
  updateTimeline(newTimeline: any[]) {
    this.timeline = newTimeline;
  }

  // Handles the playing status change
  onPlayingStatusChange(isPlaying: boolean) {
    this.isPlaying = isPlaying;
  }
}