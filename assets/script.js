document.getElementById('customizeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const avatar = document.getElementById('avatar').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const bg = document.getElementById('bg').value.trim();
    const music = document.getElementById('music').value.trim();
    const cursor = document.getElementById('cursor').value.trim();
    const discord = document.getElementById('discord').value.trim();
    const links = document.getElementById('links').value.split(',').map(l => l.trim()).filter(l => l);
    
    // Build profile URL
    const params = new URLSearchParams({
        u: username,
        avatar: avatar || '',
        bio: bio || '',
        bg: bg || '',
        music: music || '',
        cursor: cursor || '',
        discord: discord || ''
    });
    const profileUrl = `profile.html?${params.toString()}`;
    
    // Open the profile page
    window.open(profileUrl, '_blank');
});
