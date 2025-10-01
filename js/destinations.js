// Main destinations page functionality

// Initialize seasonal calendar
function initSeasonalCalendar() {
  const calendar = {
    spring: {
      species: ['Bass', 'Trout', 'Walleye'],
      conditions: ['Spawn season', 'Rising temperatures', 'Pre-summer patterns'],
      techniques: ['Sight fishing', 'Shallow cranking', 'Finesse tactics']
    },
    summer: {
      species: ['Bass', 'Catfish', 'Panfish'],
      conditions: ['Peak temperatures', 'Clear waters', 'Early/late bite'],
      techniques: ['Deep water', 'Night fishing', 'Topwater']
    },
    fall: {
      species: ['Bass', 'Pike', 'Walleye'],
      conditions: ['Cooling waters', 'Fish migration', 'Feeding increase'],
      techniques: ['Power fishing', 'Deep to shallow', 'Reaction baits']
    },
    winter: {
      species: ['Trout', 'Pike', 'Walleye'],
      conditions: ['Ice fishing', 'Slow metabolism', 'Limited access'],
      techniques: ['Ice fishing', 'Slow presentation', 'Deep water']
    }
  };

  return calendar;
}

// Generate dynamic packing list
function generatePackingList(activities, duration, season) {
  const baseItems = [
    'Fishing license',
    'Photo ID',
    'Emergency contact info',
    'First aid kit',
    'Sunscreen',
    'Insect repellent'
  ];

  const activityItems = {
    fishing: [
      'Fishing rods',
      'Tackle box',
      'Pliers',
      'Fish measuring tape',
      'Landing net',
      'Bait/lures'
    ],
    boating: [
      'Life jackets',
      'Boat registration',
      'Navigation lights',
      'Anchor',
      'Rope',
      'Safety whistle'
    ],
    camping: [
      'Tent',
      'Sleeping bag',
      'Camping chairs',
      'Cooler',
      'Cooking equipment',
      'Headlamp'
    ]
  };

  const seasonalItems = {
    summer: [
      'Sun hat',
      'Sunglasses',
      'Cooling towel',
      'Extra water',
      'Light clothing'
    ],
    winter: [
      'Thermal layers',
      'Hand warmers',
      'Ice cleats',
      'Thermos',
      'Emergency blanket'
    ]
  };

  // Combine all relevant items
  let packingList = [...baseItems];
  activities.forEach(activity => {
    if (activityItems[activity]) {
      packingList = [...packingList, ...activityItems[activity]];
    }
  });

  if (seasonalItems[season]) {
    packingList = [...packingList, ...seasonalItems[season]];
  }

  return packingList;
}

// Regulation lookup system
class RegulationSystem {
  constructor() {
    this.regulations = new Map();
  }

  async fetchRegulations(location) {
    // This would typically be an API call
    const mockRegulations = {
      'lake-tahoe': {
        license: {
          resident: '$54.00',
          nonResident: '$124.00',
          required: true,
          purchase: 'https://example.com/license'
        },
        limits: {
          trout: {
            daily: 5,
            possession: 10,
            size: '14 inch minimum'
          },
          bass: {
            daily: 5,
            possession: 10,
            size: '12 inch minimum'
          }
        },
        seasons: {
          general: 'Year-round',
          special: 'Oct 1 - Jun 15 for stream fishing'
        },
        restrictions: [
          'Artificial lures only in streams',
          'No fishing within 300 feet of mouth of streams',
          'Barbless hooks required for stream fishing'
        ]
      }
    };

    return mockRegulations[location] || null;
  }

  async checkRegulations(location) {
    if (!this.regulations.has(location)) {
      const data = await this.fetchRegulations(location);
      if (data) {
        this.regulations.set(location, data);
      }
    }
    return this.regulations.get(location);
  }

  formatRegulations(regulations) {
    if (!regulations) return null;

    return `
      <div class="regulation-info">
        <h3>Fishing Regulations for ${regulations.location}</h3>
        
        <div class="license-info">
          <h4>License Requirements</h4>
          <ul>
            <li>Resident: ${regulations.license.resident}</li>
            <li>Non-Resident: ${regulations.license.nonResident}</li>
            <li><a href="${regulations.license.purchase}">Purchase License</a></li>
          </ul>
        </div>

        <div class="limits-info">
          <h4>Catch Limits</h4>
          ${Object.entries(regulations.limits).map(([species, limits]) => `
            <div class="species-limits">
              <h5>${species}</h5>
              <ul>
                <li>Daily: ${limits.daily}</li>
                <li>Possession: ${limits.possession}</li>
                <li>Size: ${limits.size}</li>
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="season-info">
          <h4>Seasons</h4>
          <p>General: ${regulations.seasons.general}</p>
          <p>Special: ${regulations.seasons.special}</p>
        </div>

        <div class="restrictions">
          <h4>Special Restrictions</h4>
          <ul>
            ${regulations.restrictions.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize seasonal calendar
  const calendar = initSeasonalCalendar();

  // Initialize regulation system
  const regulationSystem = new RegulationSystem();

  // Handle packing list generator
  const packingListForm = document.getElementById('packingListForm');
  if (packingListForm) {
    packingListForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const activities = Array.from(e.target.querySelectorAll('[name="activities"]:checked'))
        .map(input => input.value);
      const duration = e.target.querySelector('[name="duration"]').value;
      const season = e.target.querySelector('[name="season"]').value;

      const packingList = generatePackingList(activities, duration, season);
      displayPackingList(packingList);
    });
  }

  // Handle regulation lookups
  const regulationLookup = document.getElementById('regulationLookup');
  if (regulationLookup) {
    regulationLookup.addEventListener('submit', async (e) => {
      e.preventDefault();
      const location = e.target.querySelector('[name="location"]').value;
      const regulations = await regulationSystem.checkRegulations(location);
      const formattedRegulations = regulationSystem.formatRegulations(regulations);
      
      const resultsDiv = document.getElementById('regulationResults');
      if (resultsDiv) {
        resultsDiv.innerHTML = formattedRegulations || 'No regulations found for this location.';
      }
    });
  }
});