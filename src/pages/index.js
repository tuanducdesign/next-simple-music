import { useEffect } from 'react';
import Head from 'next/head'
import songs from '../data/songs.json';

export default function Home() {
  useEffect(() => {
    const $ = document.querySelector.bind(document);
    const player = $(".player");
    const cd = $(".cd");
    const heading = $(".header h2");
    const cdThumb = $(".cd-thumb");
    const audio = $("#audio");
    const playBtn = $(".btn-toggle-play");
    const progress = $("#progress");
    const prevBtn = $(".btn-prev");
    const nextBtn = $(".btn-next");
    const randomBtn = $(".btn-random");
    const repeatBtn = $(".btn-repeat");
    const playlist = $(".playlist");

    const app = {
      currentIndex: 0,
      isPlaying: false,
      isRandom: false,
      isRepeat: false,
      config: {},
      setConfig: function (key, defaultValue) {
        this.config[key] = defaultValue;
      },
      render: function () {
        const htmls = songs.map((song, index) => {
          return `
          <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
            <img class="thumb" src="${song.image}" />
              <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
              </div>
          </div>
          `;
        });
        playlist.innerHTML = htmls.join("");
      },
      defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
          get: function () {
            return songs[this.currentIndex];
          }
        });
      },
      handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // Handles CD enlargement / reduction
        document.onscroll = function () {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const newCdWidth = cdWidth - scrollTop;

          cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
          cd.style.opacity = newCdWidth / cdWidth;
        };
        // Handle when click play
        playBtn.onclick = function () {
          if (_this.isPlaying) {
            audio.pause();
          } else {
            audio.play();
          }
        };
        // When the song is played
        audio.onplay = function () {
          _this.isPlaying = true;
          player.classList.add("playing");
        };
        // When the song is pause
        audio.onpause = function () {
          _this.isPlaying = false;
          player.classList.remove("playing");
        };
        // When the song progress changes
        audio.ontimeupdate = function () {
          if (audio.duration) {
            const progressPercent = Math.floor(
              (audio.currentTime / audio.duration) * 100
            );
            progress.value = progressPercent;
          }
        };
        // Handling when seek
        progress.onchange = function (e) {
          const seekTime = (audio.duration / 100) * e.target.value;
          audio.currentTime = seekTime;
        };
        // When next song
        nextBtn.onclick = function () {
          if (_this.isRandom) {
            _this.playRandomSong();
          } else {
            _this.nextSong();
          }
          audio.play();
          _this.render();
          _this.scrollToActiveSong();
        };
        // When prev song
        prevBtn.onclick = function () {
          if (_this.isRandom) {
            _this.playRandomSong();
          } else {
            _this.prevSong();
          }
          audio.play();
          _this.render();
          _this.scrollToActiveSong();
        };
        // Handling on / off random song
        randomBtn.onclick = function (e) {
          _this.isRandom = !_this.isRandom;
          _this.setConfig("isRandom", _this.isRandom);
          randomBtn.classList.toggle("active", _this.isRandom);
        };
        // Single-parallel repeat processing
        repeatBtn.onclick = function (e) {
          _this.isRepeat = !_this.isRepeat;
          _this.setConfig("isRepeat", _this.isRepeat);
          repeatBtn.classList.toggle("active", _this.isRepeat);
        };
        // Handle next song when audio ended
        audio.onended = function () {
          if (_this.isRepeat) {
            audio.play();
          } else {
            nextBtn.click();
          }
        };
        // Listen to playlist clicks
        playlist.onclick = function (e) {
          const songNode = e.target.closest(".song:not(.active)");
            // Handle when clicking on the song
            if (songNode) {
              _this.currentIndex = Number(songNode.dataset.index);
              _this.loadCurrentSong();
              _this.render();
              audio.play();
            }
        };
      },
      scrollToActiveSong: function () {
        setTimeout(() => {
          document.querySelector.bind(".song.active").scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });
        }, 300);
      },
      loadCurrentSong: function () {
        heading.textContent = this.currentSong.name + " - " + this.currentSong.singer;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
      },
      loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
      },
      nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= songs.length) {
          this.currentIndex = 0;
        }
        this.loadCurrentSong();
      },
      prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
          this.currentIndex = songs.length - 1;
        }
        this.loadCurrentSong();
      },
      playRandomSong: function () {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
      },
      start: function () {
        // Assign configuration from config to application
        this.loadConfig();
        // Defines properties for the object
        this.defineProperties();
        // Listening / handling events (DOM events)
        this.handleEvents();
        // Load the first song information into the UI when running the app
        this.loadCurrentSong();
        // Render playlist
        this.render();
      }
    };
    app.start();
  });
  return (
    <div class="player">
      <Head>
        <title>Next Simple Music</title>
        <meta name="description" content="Generated by create next app" />
      </Head>
        {/* Dashboard */}
        <div class="dashboard">
          {/* Header */}
          <div class="header">
            <h4>Now playing:</h4>
            <h2>NaN</h2>
          </div>
          {/* CD */}
          <div class="cd">
          <div class="cd-thumb"></div>
          </div>
          {/* Control */}
          <div class="control">
            <div class="btn btn-repeat">
              <i class="fas fa-redo"></i>
            </div>
            <div class="btn btn-prev">
              <i class="fas fa-step-backward"></i>
            </div>
            <div class="btn btn-toggle-play">
              <i class="fas fa-pause icon-pause"></i>
              <i class="fas fa-play icon-play"></i>
            </div>
            <div class="btn btn-next">
              <i class="fas fa-step-forward"></i>
            </div>
            <div class="btn btn-random">
              <i class="fas fa-random"></i>
            </div>
          </div>
          <input id="progress" class="progress" type="range" value="0" step="1" min="0" max="100" />
          <audio id="audio" src=""></audio>
        </div>
        {/* Playlist */}
        <div class="playlist">
        </div>
    </div>
  )
}
