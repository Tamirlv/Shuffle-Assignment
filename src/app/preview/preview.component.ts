import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnChanges, AfterViewInit {
  @Input() timeline: any[] = [];
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;
  currentSceneIndex = 0;
  currentSceneUrl: string = '';
  currentSceneDuration = 0;
  currentTime = 0;
  totalDuration = 0;
  isPlaying = false;
  isSliderChanging = false;
  markers: number[] = [];
  progressPosition = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['timeline']) {
      if (this.timeline.length > 0) {
        const lastScene = this.timeline[this.timeline.length - 1];
        lastScene.color = this.getRandomColor();
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
  ngAfterViewInit() {
    this.setupPlayer();
  }

  calculateTotalDuration() {
    this.totalDuration = this.timeline.reduce((acc, scene) => acc + scene.duration, 0);
  }

  setScene(scene: any) {
    this.currentSceneUrl = scene.url;
    this.currentSceneDuration = scene.duration;
    this.currentTime = this.timeline.slice(0, this.currentSceneIndex).reduce((acc, s) => acc + s.duration, 0);
  }

  setupPlayer() {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.addEventListener('canplaythrough', this.onCanPlayThrough.bind(this));
      videoElement.addEventListener('loadeddata', this.onLoadedData.bind(this));
      videoElement.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
      videoElement.addEventListener('ended', this.onEnded.bind(this));
    }
  }

  onCanPlayThrough(event: Event) {
    if (this.isPlaying) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.play();
    }
  }

  onLoadedData(event: Event) {
    if (this.isPlaying) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.play();
    }
  }

  onTimeUpdate(event: Event) {
    if (!this.isSliderChanging) {
      const videoElement = this.videoPlayer.nativeElement;
      const currentSceneElapsedTime = videoElement.currentTime;
      const previousScenesDuration = this.timeline
        .slice(0, this.currentSceneIndex)
        .reduce((acc, scene) => acc + scene.duration, 0);
      this.currentTime = previousScenesDuration + currentSceneElapsedTime;
      this.updateProgress();
    }
  }

  onEnded() {
    this.currentSceneIndex++;
    if (this.currentSceneIndex < this.timeline.length) {
      this.setScene(this.timeline[this.currentSceneIndex]);
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.src = this.currentSceneUrl;
      videoElement.load(); // Pre-load the next scene
    } else {
      this.currentSceneIndex = 0; // Reset to the beginning or stop playback
      this.currentSceneUrl = '';
      this.isPlaying = false; // Stop playing
      this.progressPosition = 0; // Reset progress position
    }
  }

  togglePlayPause() {
    const videoElement = this.videoPlayer.nativeElement;
  
    if (this.isPlaying) {
      videoElement.pause();
      this.isPlaying = false;
    } else {
      if (this.currentSceneUrl === '' && this.timeline.length > 0) {
        this.currentSceneIndex = 0;
        this.setScene(this.timeline[this.currentSceneIndex]);
      }
  
      if (videoElement.readyState >= 3) { // If the video is ready
        videoElement.play();
      } else {
        videoElement.load(); // Reload the video element
      }
      this.isPlaying = true;
    }
  }
  onSliderChange(event: any) {
    this.isSliderChanging = true;
    const newTime = event.value;
    this.setCurrentTime(newTime);
    this.isSliderChanging = false;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  generateMarkers() {
    this.markers = Array.from({ length: this.totalDuration }, (_, i) => i + 1);
  }

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
          videoElement.play();
        }
        this.updateProgress();
        break;
      }
    }
  }
 

  updateProgress() {
    this.progressPosition = (this.currentTime / this.totalDuration) * 100;
  }

  onMarkerClick(marker: number) {
    this.setCurrentTime(marker);
  }
}
