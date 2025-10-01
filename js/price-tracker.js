/* Price Tracker JavaScript */

// Price Chart Setup
function initPriceChart() {
  const ctx = document.getElementById('priceChart').getContext('2d');
  const priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // Will be populated with dates
      datasets: [{
        label: 'Price History',
        data: [], // Will be populated with price data
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `$${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            borderDash: [5, 5]
          },
          ticks: {
            callback: function(value) {
              return `$${value}`;
            }
          }
        }
      }
    }
  });

  return priceChart;
}

// Price Alert Setup
class PriceTracker {
  constructor() {
    this.alerts = [];
    this.priceHistory = {};
    this.chart = null;
  }

  initialize() {
    this.chart = initPriceChart();
    this.loadAlerts();
    this.setupEventListeners();
  }

  loadAlerts() {
    // Load saved alerts from localStorage
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
      this.alerts = JSON.parse(savedAlerts);
      this.renderAlertsList();
    }
  }

  setupEventListeners() {
    // Alert form submission
    const alertForm = document.getElementById('alertForm');
    alertForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createAlert();
    });

    // Price type radio buttons
    const priceTypeRadios = document.querySelectorAll('input[name="alertType"]');
    priceTypeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.togglePriceInput(radio.value);
      });
    });
  }

  togglePriceInput(type) {
    const priceInput = document.getElementById('targetPrice');
    const percentInput = document.getElementById('percentDrop');
    
    if (type === 'specific') {
      priceInput.style.display = 'block';
      percentInput.style.display = 'none';
    } else {
      priceInput.style.display = 'none';
      percentInput.style.display = 'block';
    }
  }

  createAlert() {
    const form = document.getElementById('alertForm');
    const productId = form.elements.productId.value;
    const alertType = form.elements.alertType.value;
    const targetPrice = alertType === 'specific' 
      ? form.elements.targetPrice.value 
      : this.calculateTargetPrice(form.elements.percentDrop.value);

    const alert = {
      id: Date.now(),
      productId,
      type: alertType,
      targetPrice,
      created: new Date().toISOString()
    };

    this.alerts.push(alert);
    this.saveAlerts();
    this.renderAlertsList();
    form.reset();
  }

  calculateTargetPrice(percentDrop) {
    const currentPrice = this.getCurrentPrice();
    return currentPrice * (1 - (percentDrop / 100));
  }

  getCurrentPrice() {
    // Get current price from product data
    return 199.99; // Example price
  }

  saveAlerts() {
    localStorage.setItem('priceAlerts', JSON.stringify(this.alerts));
  }

  renderAlertsList() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';

    this.alerts.forEach(alert => {
      const alertElement = this.createAlertElement(alert);
      alertsList.appendChild(alertElement);
    });
  }

  createAlertElement(alert) {
    const li = document.createElement('div');
    li.className = 'alert-item';
    li.innerHTML = `
      <div class="alert-info">
        <h3>${this.getProductName(alert.productId)}</h3>
        <div class="alert-meta">
          <span>Target: $${alert.targetPrice}</span>
          <span>•</span>
          <span>Created: ${new Date(alert.created).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="alert-actions">
        <button onclick="priceTracker.editAlert(${alert.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="priceTracker.deleteAlert(${alert.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    return li;
  }

  getProductName(productId) {
    // Get product name from product data
    return "Shimano Stradic FL Spinning Rod"; // Example product name
  }

  editAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return;

    // Populate form with alert data
    const form = document.getElementById('alertForm');
    form.elements.productId.value = alert.productId;
    form.elements.alertType.value = alert.type;
    this.togglePriceInput(alert.type);
    
    if (alert.type === 'specific') {
      form.elements.targetPrice.value = alert.targetPrice;
    } else {
      form.elements.percentDrop.value = this.calculatePercentDrop(alert.targetPrice);
    }

    // Remove old alert
    this.deleteAlert(alertId);
  }

  deleteAlert(alertId) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.saveAlerts();
    this.renderAlertsList();
  }

  calculatePercentDrop(targetPrice) {
    const currentPrice = this.getCurrentPrice();
    return ((currentPrice - targetPrice) / currentPrice * 100).toFixed(2);
  }

  updatePriceHistory(productId, newData) {
    this.priceHistory[productId] = newData;
    this.updateChart(productId);
    this.checkAlerts(productId);
  }

  updateChart(productId) {
    const data = this.priceHistory[productId];
    if (!data || !this.chart) return;

    this.chart.data.labels = data.dates;
    this.chart.data.datasets[0].data = data.prices;
    this.chart.update();
  }

  checkAlerts(productId) {
    const currentPrice = this.getCurrentPrice();
    const relevantAlerts = this.alerts.filter(a => a.productId === productId);

    relevantAlerts.forEach(alert => {
      if (currentPrice <= alert.targetPrice) {
        this.triggerAlert(alert);
      }
    });
  }

  triggerAlert(alert) {
    // Show notification
    const notification = new Notification('Price Alert!', {
      body: `${this.getProductName(alert.productId)} has reached your target price of $${alert.targetPrice}!`,
      icon: '/images/logo.png'
    });

    // Remove alert after triggering
    this.deleteAlert(alert.id);
  }
}

// Initialize Price Tracker
const priceTracker = new PriceTracker();
document.addEventListener('DOMContentLoaded', () => {
  priceTracker.initialize();
});