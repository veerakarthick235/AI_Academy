document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('leaderboard-body');
    
    fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                populateLeaderboard(data.leaderboard);
            } else {
                leaderboardBody.innerHTML = `<tr><td colspan="4">Could not load leaderboard.</td></tr>`;
            }
        })
        .catch(err => {
            console.error('Error fetching leaderboard:', err);
            leaderboardBody.innerHTML = `<tr><td colspan="4">Error loading leaderboard.</td></tr>`;
        });
});

function populateLeaderboard(leaderboardData) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = ''; // Clear loading text

    if (leaderboardData.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="4">No data available yet.</td></tr>`;
        return;
    }

    leaderboardData.forEach((user, index) => {
        const rank = index + 1;
        const rankClass = `rank-${rank}`;
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="rank-cell ${rank <= 3 ? rankClass : ''}">${rank}</td>
            <td class="user-cell">
                <img src="${user.profilePic}" alt="Profile">
                <span>${user.name}</span>
            </td>
            <td>${user.college}</td>
            <td class="score-cell">${user.score}%</td>
        `;
        leaderboardBody.appendChild(tr);
    });
}