import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Holds the timeline data
  timeline: any = [];

  // Updates the timeline with new data
  updateTimeline(newTimeline: any[]) {
    this.timeline = newTimeline;
  }
}
