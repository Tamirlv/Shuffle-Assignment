import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnChanges, AfterViewInit {
  @Input() timeline: any[] = []; // Timeline input from parent component
  @Output() playingStatus = new EventEmitter<boolean>(); // Output to emit playing status
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>; // Reference to the video element
  @ViewChild('timelineContainer', { static: false }) timelineContainer!: ElementRef<HTMLDivElement>; // Reference to the timeline container
  currentSceneIndex = 0; // Index of the current scene
  currentSceneUrl: string = ''; // URL of the current scene
  currentSceneDuration = 0; // Duration of the current scene
  currentTime = 0; // Current time of the video
  totalDuration = 0; // Total duration of all scenes
  isPlaying = false; // Indicates if the video is playing
  isSliderChanging = false; // Indicates if the slider is being changed
  markers: number[] = []; // Array of time markers
  progressPosition = 0; // Position of the progress line
  zoomLevel: number = 1; // Zoom level for the timeline
  zoomOrigin: number = 0; // Zoom origin percentage for the timeline

  // Called when input properties change. Updates the scene and timeline properties.
  ngOnChanges(changes: SimpleChanges) {
    if (changes['timeline']) {
      if (this.timeline.length > 0) {
        this.currentSceneIndex = 0;
        this.setScene(this.timeline[this.currentSceneIndex]);
        this.calculateTotalDuration();
        this.generateMarkers();
      } else {
        this.currentSceneUrl = '';
        this.totalDuration = 0;
      }
    }
  }

  // Called after the view has been initialized. Sets up the video player event listeners.
  ngAfterViewInit() {
    this.setupPlayer();
  }

  // Calculates the total duration of the timeline.
  calculateTotalDuration() {
    this.totalDuration = this.timeline.reduce((acc, scene) => acc + scene.duration, 0);
  }

  // Sets the current scene based on the given scene object.
  setScene(scene: any) {
    this.currentSceneUrl = scene.url;
    this.currentSceneDuration = scene.duration;
    this.currentTime = this.timeline.slice(0, this.currentSceneIndex).reduce((acc, s) => acc + s.duration, 0);
  }

  // Sets up event listeners for the video player.
  setupPlayer() {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.addEventListener('loadedmetadata', this.onLoadedMetadata.bind(this));
      videoElement.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
      videoElement.addEventListener('ended', this.onEnded.bind(this));
    }
  }

  // Called when the video metadata is loaded. Plays the video if it is currently playing.
  onLoadedMetadata(event: Event) {
    if (this.isPlaying) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }

  // Called when the video's time updates. Updates the current time and progress position.
  onTimeUpdate(event: Event) {
    if (!this.isSliderChanging) {
      const videoElement = this.videoPlayer.nativeElement;
      const currentSceneElapsedTime = videoElement.currentTime;
      const previousScenesDuration = this.timeline.slice(0, this.currentSceneIndex).reduce((acc, scene) => acc + scene.duration, 0);
      this.currentTime = previousScenesDuration + currentSceneElapsedTime;
      this.updateProgress();
    }
  }

  // Called when the video ends. Moves to the next scene or stops playback if at the end.
  onEnded() {
    this.currentSceneIndex++;
    if (this.currentSceneIndex < this.timeline.length) {
      this.preloadNextScene();
    } else {
      this.currentSceneIndex = 0;
      this.currentSceneUrl = '';
      this.isPlaying = false;
      this.progressPosition = 0;
      this.playingStatus.emit(false); // Emit playing status as false
    }
  }

  // Preloads the next scene and starts playback.
  preloadNextScene() {
    const videoElement = this.videoPlayer.nativeElement;
    this.setScene(this.timeline[this.currentSceneIndex]);
    videoElement.src = this.currentSceneUrl;
    videoElement.load();
  }

  // Toggles between play and pause states.
  togglePlayPause() {
    const videoElement = this.videoPlayer.nativeElement;
    if (this.isPlaying) {
      videoElement.pause();
      this.isPlaying = false;
      this.playingStatus.emit(false); // Emit playing status as false
    } else {
      if (this.currentSceneUrl === '' && this.timeline.length > 0) {
        this.currentSceneIndex = 0;
        this.setScene(this.timeline[this.currentSceneIndex]);
      }

      if (videoElement.readyState >= 3) { // If the video is ready
        videoElement.play().catch(error => {
          console.error('Error playing video:', error);
        });
      } else {
        videoElement.load(); // Reload the video element
      }
      this.isPlaying = true;
      this.playingStatus.emit(true); // Emit playing status as true
    }
  }

  // Formats the given time in seconds to a mm:ss string.
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  // Generates markers for the timeline.
  generateMarkers() {
    this.markers = Array.from({ length: this.totalDuration }, (_, i) => i + 1);
  }

  // Sets the current time of the video to the given time.
  setCurrentTime(newTime: number) {
    let accumulatedTime = 0;
    for (let i = 0; i < this.timeline.length; i++) {
      accumulatedTime += this.timeline[i].duration;
      if (newTime < accumulatedTime) {
        this.currentSceneIndex = i;
        const sceneStartTime = accumulatedTime - this.timeline[i].duration;
        this.currentSceneUrl = this.timeline[i].url;
        this.currentSceneDuration = this.timeline[i].duration;
        const videoElement = this.videoPlayer.nativeElement;
        if (videoElement.src !== this.currentSceneUrl) {
          videoElement.src = this.currentSceneUrl;
          videoElement.load();
        }
        videoElement.currentTime = newTime - sceneStartTime;
        this.currentTime = newTime;
        if (this.isPlaying) {
          videoElement.play().catch(error => {
            console.error('Error playing video:', error);
          });
        }
        this.updateProgress();
        break;
      }
    }
  }

  // Updates the position of the progress line.
  updateProgress() {
    this.progressPosition = (this.currentTime / this.totalDuration) * 100;
  }

  // Called when a marker is clicked. Sets the current time to the marker's time.
  onMarkerClick(marker: number) {
    this.setCurrentTime(marker);
  }

  // Handles the scroll event to zoom in/out of the timeline.
  onScroll(event: WheelEvent) {
    event.preventDefault();
    const timelineContainerRect = this.timelineContainer.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - timelineContainerRect.left;
    const zoomOriginPercentage = (mouseX / this.timelineContainer.nativeElement.offsetWidth) * 100;

    if (event.deltaY < 0) {
      this.zoomLevel = Math.min(this.zoomLevel + 0.1, 5);
    } else {
      this.zoomLevel = Math.max(this.zoomLevel - 0.1, 1);
    }

    this.zoomOrigin = zoomOriginPercentage;
  }
}