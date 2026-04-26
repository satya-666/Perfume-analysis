document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch data
        const response = await fetch('dashboard_data.json');
        const data = await response.json();
        
        // Update KPIs
        updateKPIs(data.kpis);
        
        // Render Charts
        renderRevenueChart(data.topBrands);
        renderTypeChart(data.topTypes);
        
        // Populate Table
        populateTable(data.items);
        
        // Setup simple navigation
        setupNavigation();
        
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function updateKPIs(kpis) {
    // Animate numbers up to their value
    animateValue("kpi-revenue", 0, kpis.totalRevenue, 1500, formatCurrency);
    animateValue("kpi-sold", 0, kpis.totalSold, 1500, formatNumber);
    animateValue("kpi-avg-price", 0, kpis.averagePrice, 1500, (val) => formatCurrency(val));
    animateValue("kpi-listings", 0, kpis.totalListings, 1500, formatNumber);
}

function animateValue(id, start, end, duration, formatter) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart curve
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeProgress * (end - start) + start);
        obj.innerHTML = formatter(current);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = formatter(end);
        }
    };
    window.requestAnimationFrame(step);
}

// Chart defaults for dark theme
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";

function renderRevenueChart(brands) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Sort by revenue and take top 10
    const labels = brands.map(b => b.brand);
    const revenueData = brands.map(b => b.revenue);
    
    // Gradient for bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.4)');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue ($)',
                data: revenueData,
                backgroundColor: gradient,
                borderRadius: 6,
                borderWidth: 0,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 17, 26, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (context) => formatCurrency(context.raw)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { callback: (value) => '$' + (value/1000) + 'k' }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });
}

function renderTypeChart(types) {
    const ctx = document.getElementById('typeChart').getContext('2d');
    
    const labels = types.map(t => t.type);
    const data = types.map(t => t.count);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#0f111a',
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 17, 26, 0.9)',
                    padding: 12
                }
            }
        }
    });
}

function populateTable(items) {
    const tbody = document.querySelector('#perfumeTable tbody');
    
    // Sort by revenue descending, take top 10
    const topItems = [...items].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    
    tbody.innerHTML = '';
    
    topItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        // Add a small stagger animation
        tr.style.animation = `fadeInUp 0.5s ease-out ${0.7 + (index * 0.05)}s forwards`;
        tr.style.opacity = '0';
        
        tr.innerHTML = `
            <td><strong>${item.brand}</strong></td>
            <td><div style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.title}">${item.title}</div></td>
            <td><span class="badge-type">${item.type}</span></td>
            <td>${formatCurrency(item.price)}</td>
            <td>${formatNumber(item.sold)}</td>
            <td style="color: #10b981; font-weight: 600;">${formatCurrency(item.revenue)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const tabSections = document.querySelectorAll('.tab-section');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active from all links
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Get target tab and title
            const targetId = this.querySelector('a').getAttribute('data-target');
            const newTitle = this.querySelector('a').getAttribute('data-title');
            
            // Hide all sections
            tabSections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });
            
            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                // Small timeout to allow display:block to apply before adding active for animation (if any)
                setTimeout(() => targetSection.classList.add('active'), 10);
            }
            
            // Update page title
            if (pageTitle && newTitle) {
                pageTitle.textContent = newTitle;
            }
        });
    });
}
