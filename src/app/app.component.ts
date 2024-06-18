import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  timeline: any = [];

  updateTimeline(newTimeline: any[]) {
    this.timeline = newTimeline;
  }
}
