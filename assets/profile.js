// Helper for query string overrides (e.g. profile.html?u=Shx1&avatar=...)
const params = new URLSearchParams(window.location.search);
const getParam = (key, fallback = '') => params.get(key) || fallback;

// Branding (browser tab title)
// Default is set to Shx1; can be overridden via ?u=<name>
const siteBranding = getParam('u', 'Shx1');
document.title = siteBranding;

// Profile defaults (can be overridden via query params)
const defaultAvatar = getParam('avatar', '');
const defaultBio = getParam('bio', 'pvp nalang naka cheat pa');
const defaultBgVideo = getParam('bg', 'assets/background.mp4');
const defaultMusicSrc = getParam('music', 'assets/music.mp3');
const defaultMusicTitle = getParam('musicTitle', 'Wish I Never Met You');
const defaultMusicArtist = getParam('musicArtist', 'Tory Lanez');
const defaultMusicCover = getParam('musicCover', 'assets/cover.jpg');
const defaultLogo = getParam('logo', 'assets/logo.png');

// Discord Lanyard integration (used to sync avatar + title)
const discordId = '702780101661687840';

let audioInitialized = false;
let bgAudio = null;

// Audio meta (displayed in UI)
const musicSrc = defaultMusicSrc;
const musicTitle = defaultMusicTitle;
const musicArtist = defaultMusicArtist;
const musicCover = defaultMusicCover;

function showAudioPlayer() {
    const audioPlayer = document.getElementById('audio-player');
    if (audioPlayer) {
        audioPlayer.classList.remove('hidden');
    }
}

function initLocalAudio() {
    if (audioInitialized) return;
    audioInitialized = true;

    // Create audio element
    const audio = document.createElement('audio');
    audio.id = 'bg-audio';
    audio.src = musicSrc;
    audio.loop = true;
    audio.volume = 0.3;
    audio.autoplay = false;
    document.body.appendChild(audio);

    bgAudio = audio;

    // Update UI labels
    const audioTitle = document.getElementById('audio-title');
    const audioArtist = document.getElementById('audio-artist');
    const audioCover = document.getElementById('audio-cover');

    if (audioTitle) audioTitle.textContent = musicTitle;
    if (audioArtist) audioArtist.textContent = musicArtist;
    if (audioCover) {
        audioCover.style.backgroundImage = `url(${musicCover})`;
        audioCover.style.backgroundSize = 'cover';
    }

    // Wire up controls
    const audioPrevBtn = document.getElementById('audio-prev');
    const audioPlayBtn = document.getElementById('audio-play');
    const audioNextBtn = document.getElementById('audio-next');
    const audioVolume = document.getElementById('audio-volume');

    if (audioPrevBtn) {
        audioPrevBtn.addEventListener('click', () => {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        });
    }

    if (audioPlayBtn) {
        audioPlayBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                audioPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            } else {
                audio.pause();
                audioPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
        });
    }

    if (audioNextBtn) {
        audioNextBtn.addEventListener('click', () => {
            audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 10);
        });
    }

    if (audioVolume) {
        audioVolume.addEventListener('input', (e) => {
            audio.volume = parseFloat(e.target.value);
        });
    }
}

// Set background video
const bgVideo = document.getElementById('bg-video');
bgVideo.src = defaultBgVideo;
bgVideo.style.display = 'block';
document.getElementById('profile-bg').style.backgroundImage = 'none';

// Fetch and display user profile
function setFavicon(url) {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = url;
}

function loadUserProfile() {
    // View counter (stored locally in browser)
    const viewKey = 'profile_view_count';
    const currentViews = parseInt(localStorage.getItem(viewKey) || '0', 10) + 1;
    localStorage.setItem(viewKey, currentViews);
    document.getElementById('view-count').textContent = currentViews;

    const avatarEl = document.getElementById('avatar');
    const usernameEl = document.getElementById('username');
    const bioEl = document.getElementById('bio');

    // Apply overrides (query params) first
    if (defaultAvatar) {
        avatarEl.src = defaultAvatar;
        setFavicon(defaultAvatar);
    } else {
        avatarEl.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
        setFavicon('https://cdn.discordapp.com/embed/avatars/0.png');
    }

    usernameEl.textContent = siteBranding;
    bioEl.textContent = '';

    // Logo override (allows passing ?logo=assets/my-logo.png)
    const logoEl = document.querySelector('.site-logo');
    if (logoEl) {
        logoEl.src = defaultLogo;
    }

    // Animate the default bio as a looping typewriter (slow) effect
    function loopTypeWriter(el, text, delay = 120, pause = 2400) {
        let i = 0;

        function step() {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i += 1;
                setTimeout(step, delay);
            } else {
                setTimeout(() => {
                    el.textContent = '';
                    i = 0;
                    step();
                }, pause);
            }
        }

        el.textContent = '';
        step();
    }

    if (!params.get('bio')) {
        loopTypeWriter(bioEl, defaultBio);
    } else {
        // If the bio is provided via URL, just show it without looping.
        bioEl.textContent = defaultBio;
    }

    // If we have a Discord ID, fetch real data and only overwrite if no overrides are provided.
    if (!discordId) return;

    const lanyardUrl = `https://api.lanyard.rest/v1/users/${discordId}`;
    const fetchUrl = window.location.protocol === 'file:'
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(lanyardUrl)}`
        : lanyardUrl;

    fetch(fetchUrl)
        .then(r => r.json())
        .then(data => {
            const user = data.data.discord_user;
            const status = data.data.discord_status;

            if (!defaultAvatar) {
                const url = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
                avatarEl.src = url;
                setFavicon(url);
            }

            // Keep the username fixed to the site branding (Shx1) while syncing avatar.
            // Update the browser tab to show both name and handle like Discord.
            document.title = `${siteBranding} (@${user.username})`;

            // Keep the bio fixed to the default looping text (ignore Discord bio)

            // Sync status dot color
            const statusDot = document.getElementById('status-dot');
            if (statusDot) {
                const statusMap = {
                    online: '#3ba55d',
                    idle: '#faa61a',
                    dnd: '#f04747',
                    offline: 'rgba(255,255,255,0.35)',
                };
                statusDot.style.background = statusMap[status] || 'rgba(255,255,255,0.35)';
            }
        })
        .catch(() => {
            if (!defaultAvatar) {
                avatarEl.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            }
            usernameEl.textContent = 'Unknown';
            if (!params.get('bio')) {
                bioEl.textContent = 'Unable to load profile';
            }
        });
}


function enterSite() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }

    const snow = document.getElementById('snow-video');
    if (snow) {
        snow.pause();
        snow.style.display = 'none';
    }

    showAudioPlayer();
    initLocalAudio();

    // Auto-play audio when user enters (this is permitted because it is a direct interaction)
    if (bgAudio) {
        bgAudio.play().catch(() => {
            // autoplay blocked: user can press play manually
        });
        const playBtn = document.getElementById('audio-play');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
    }

    loadUserProfile();
}

// Start the page when the user confirms (click/tap)
const enterOverlay = document.getElementById('overlay');
if (enterOverlay) {
    enterOverlay.addEventListener('click', enterSite);
} else {
    // Fallback if overlay is missing
    enterSite();
}

// FontAwesome for icons
const fa = document.createElement('link');
fa.rel = 'stylesheet';
fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
document.head.appendChild(fa);
