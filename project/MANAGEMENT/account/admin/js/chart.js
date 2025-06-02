document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('lineChart').getContext('2d');

    // Gradient colors for a modern look
    const gradientStroke = ctx.createLinearGradient(0, 0, 600, 0);
    gradientStroke.addColorStop(0, "#a18cd1");
    gradientStroke.addColorStop(1, "#fbc2eb");

    const gradientFill = ctx.createLinearGradient(0, 0, 0, 250);
    gradientFill.addColorStop(0, "rgba(161, 140, 209, 0.25)");
    gradientFill.addColorStop(1, "rgba(251, 194, 235, 0)");

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Active Users',
            data: [10, 24, 18, 35, 47, 65],
            fill: true,
            backgroundColor: gradientFill,
            borderColor: gradientStroke,
            borderWidth: 4,
            tension: 0.5,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#a18cd1",
            pointRadius: 7,
            pointHoverRadius: 11,
            pointBorderWidth: 4,
            pointStyle: 'circle',
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: "#fff",
                titleColor: "#a18cd1",
                bodyColor: "#333",
                borderColor: "#a18cd1",
                borderWidth: 1.5,
                padding: 14,
                cornerRadius: 7,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return ' ' + context.dataset.label + ': ' + context.parsed.y;
                    }
                }
            }
        },
        layout: {
            padding: {
                top: 12,
                bottom: 8,
                left: 12,
                right: 12
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: "#a18cd1",
                    font: {
                        size: 15,
                        weight: 'bold'
                    }
                }
            },
            y: {
        beginAtZero: true,
        grid: { color: "rgba(161, 140, 209, 0.12)", drawBorder: false },
        ticks: {
            stepSize: 10,
            color: "#a18cd1",
            font: { size: 15, weight: 'bold' },
            callback: function(value) { return value; }
        }
            }
        },
        animation: {
            duration: 1200,
            easing: 'easeOutQuart'
        }
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: options,
        plugins: [{
            // Glow effect for points
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                chart.getDatasetMeta(0).data.forEach(point => {
                    ctx.save();
                    ctx.shadowColor = "#a18cd1";
                    ctx.shadowBlur = 16;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
                    ctx.fillStyle = "#fff";
                    ctx.fill();
                    ctx.restore();
                });
            }
        }]
    });
});