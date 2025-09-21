// This script runs when the DOM is fully loaded and ready
document.addEventListener('DOMContentLoaded', function () {

    // --- CHART & ELEMENT REFERENCES ---
    let performanceChart;
    const ctxPerformance = document.getElementById('performanceChart')?.getContext('2d');
    const ctxPie = document.getElementById('pieChart')?.getContext('2d');
    
    // New profile header elements
    const profilePicElem = document.getElementById('profile-header-pic');
    const nameElem = document.getElementById('profile-header-name');
    const emailElem = document.getElementById('profile-header-email');
    const degreeElem = document.getElementById('profile-header-degree');
    const collegeElem = document.getElementById('profile-header-college');
    
    // Chart-related elements
    const completionPercentageElem = document.getElementById('completionPercentage');
    const monthlyBtn = document.getElementById('monthlyBtn');
    const weeklyBtn = document.getElementById('weeklyBtn');

    // Get the User ID from the body's data attribute
    const userId = document.body.dataset.userId;

    if (!userId) {
        console.error("User ID not found!");
        return; // Stop if there's no user ID
    }

    // --- MAIN DATA FETCHING ---
    fetch(`/api/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(apiResponse => {
            if (apiResponse.success) {
                const userData = apiResponse.data;
                
                populateProfileHeader(userData);
                
                if (ctxPie) {
                    createCoursesPieChart(userData.courses);
                }
                
                if (ctxPerformance) {
                    createPerformanceChart(userData.performance.monthly, 'monthly');
                    setupChartToggles(userData.performance);
                }
            } else {
                console.error("API Error:", apiResponse.message);
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
        });

    // --- HELPER FUNCTIONS ---

    /**
     * Populates the new profile header with user data.
     */
    function populateProfileHeader(userData) {
        if (profilePicElem && userData.profileImageUrl) {
            profilePicElem.src = userData.profileImageUrl;
        }
        if (nameElem) {
            nameElem.textContent = `Welcome back, ${userData.name}!`;
        }
        if (emailElem) {
            emailElem.textContent = userData.email;
        }
        if (degreeElem) {
            degreeElem.textContent = userData.degree;
        }
        if (collegeElem) {
            collegeElem.textContent = userData.college;
        }
    }

    /**
     * Creates and renders the donut chart for courses overview.
     */
    function createCoursesPieChart(coursesData) {
        const completed = coursesData.completed || 0;
        const inProgress = coursesData.inProgress || 0;
        const totalCourses = completed + inProgress;
        const percentage = totalCourses > 0 ? Math.round((completed / totalCourses) * 100) : 0;

        if (completionPercentageElem) {
            completionPercentageElem.textContent = `${percentage}%`;
        }

        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress'],
                datasets: [{
                    data: [completed, inProgress],
                    backgroundColor: ['#0379F4', '#009600'],
                    borderColor: ['#ffffff'],
                    borderWidth: 4,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });
    }

    /**
     * Creates or updates the performance bar chart.
     */
    function createPerformanceChart(data, period) {
        const labels = period === 'monthly' 
            ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            : ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Attendance %',
                    data: data.attendance,
                    backgroundColor: '#A9CCE3',
                    borderColor: '#A9CCE3',
                    borderWidth: 1,
                    borderRadius: 5
                },
                {
                    label: 'Highest Score %',
                    data: data.exam,
                    backgroundColor: '#0379F4',
                    borderColor: '#0379F4',
                    borderWidth: 1,
                    borderRadius: 5
                }
            ]
        };

        if (performanceChart) {
            performanceChart.data = chartData;
            performanceChart.update();
        } else {
            performanceChart = new Chart(ctxPerformance, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                    },
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }
            });
        }
    }
    
    /**
     * Sets up the event listeners for the weekly/monthly toggle buttons.
     */
    function setupChartToggles(performanceData) {
        if (monthlyBtn && weeklyBtn) {
            monthlyBtn.addEventListener('click', () => {
                createPerformanceChart(performanceData.monthly, 'monthly');
                monthlyBtn.classList.add('active');
                weeklyBtn.classList.remove('active');
            });

            weeklyBtn.addEventListener('click', () => {
                createPerformanceChart(performanceData.weekly, 'weekly');
                weeklyBtn.classList.add('active');
                monthlyBtn.classList.remove('active');
            });
        }
    }
});