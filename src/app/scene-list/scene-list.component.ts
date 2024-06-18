import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-scene-list',
  templateUrl: './scene-list.component.html',
  styleUrls: ['./scene-list.component.css']
})
export class SceneListComponent {
  scenes = [
    { id: 1, name: 'Scene 1', url: 'https://content.shuffll.com/files/background-music/1.mp4', duration: 5 },
    { id: 2, name: 'Scene 2', url: 'https://content.shuffll.com/files/background-music/2.mp4', duration: 5 },
    { id: 3, name: 'Scene 3', url: 'https://content.shuffll.com/files/background-music/3.mp4', duration: 5 },
  ];

  drag(event: any, scene: any) {
    event.dataTransfer.setData('scene', JSON.stringify(scene));
  }

  playScene(scene: any) {
    const videoPlayer: HTMLVideoElement | null = document.querySelector(`video[src="${scene.url}"]`);
    if (videoPlayer) {
      videoPlayer.style.display = 'block';
      videoPlayer.play();

      videoPlayer.addEventListener('ended', () => {
        videoPlayer.style.display = 'none';
      }, { once: true });
    }
  }
}
