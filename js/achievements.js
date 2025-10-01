// Achievement System
class AchievementSystem {
    constructor() {
        this.achievements = {
            catches: [
                {
                    id: 'first_catch',
                    title: 'First Catch',
                    description: 'Catch your first fish',
                    icon: 'fa-fish',
                    requirement: 1,
                    points: 10
                },
                {
                    id: 'catch_master',
                    title: 'Catch Master',
                    description: 'Catch 100 fish',
                    icon: 'fa-trophy',
                    requirement: 100,
                    points: 50
                }
            ],
            species: [
                {
                    id: 'species_explorer',
                    title: 'Species Explorer',
                    description: 'Catch 5 different species',
                    icon: 'fa-search',
                    requirement: 5,
                    points: 20
                },
                {
                    id: 'species_master',
                    title: 'Species Master',
                    description: 'Catch 20 different species',
                    icon: 'fa-crown',
                    requirement: 20,
                    points: 100
                }
            ],
            events: [
                {
                    id: 'event_participant',
                    title: 'Event Participant',
                    description: 'Participate in your first event',
                    icon: 'fa-calendar-check',
                    requirement: 1,
                    points: 15
                },
                {
                    id: 'event_enthusiast',
                    title: 'Event Enthusiast',
                    description: 'Participate in 10 events',
                    icon: 'fa-calendar-star',
                    requirement: 10,
                    points: 75
                }
            ],
            trips: [
                {
                    id: 'adventurer',
                    title: 'Adventurer',
                    description: 'Go on 5 fishing trips',
                    icon: 'fa-compass',
                    requirement: 5,
                    points: 25
                },
                {
                    id: 'explorer',
                    title: 'Explorer',
                    description: 'Visit 10 different fishing spots',
                    icon: 'fa-map-marked-alt',
                    requirement: 10,
                    points: 50
                }
            ],
            social: [
                {
                    id: 'community_member',
                    title: 'Community Member',
                    description: 'Make your first forum post',
                    icon: 'fa-comments',
                    requirement: 1,
                    points: 10
                },
                {
                    id: 'helpful_angler',
                    title: 'Helpful Angler',
                    description: 'Get 10 helpful post reactions',
                    icon: 'fa-hand-helping',
                    requirement: 10,
                    points: 30
                }
            ]
        };
    }

    // Check achievements for a specific category
    async checkAchievements(userId, category, value) {
        try {
            const userProgress = await this.getUserProgress(userId);
            const categoryAchievements = this.achievements[category] || [];
            const newAchievements = [];

            categoryAchievements.forEach(achievement => {
                const hasAchievement = userProgress.achievements.includes(achievement.id);
                const meetsRequirement = value >= achievement.requirement;

                if (!hasAchievement && meetsRequirement) {
                    newAchievements.push(achievement);
                }
            });

            if (newAchievements.length > 0) {
                await this.awardAchievements(userId, newAchievements);
                return newAchievements;
            }

            return [];
        } catch (error) {
            console.error('Error checking achievements:', error);
            return [];
        }
    }

    // Get user's achievement progress
    async getUserProgress(userId) {
        const response = await fetch(`/api/users/${userId}/achievements`);
        if (!response.ok) {
            throw new Error('Failed to fetch user progress');
        }
        return response.json();
    }

    // Award achievements to user
    async awardAchievements(userId, achievements) {
        const response = await fetch(`/api/users/${userId}/achievements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                achievements: achievements.map(a => ({
                    id: a.id,
                    points: a.points,
                    timestamp: new Date().toISOString()
                }))
            })
        });

        if (!response.ok) {
            throw new Error('Failed to award achievements');
        }

        // Trigger achievement notifications
        achievements.forEach(achievement => {
            this.showAchievementNotification(achievement);
        });
    }

    // Show achievement notification
    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <h3>Achievement Unlocked!</h3>
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <p class="points">+${achievement.points} points</p>
            </div>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after display
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Calculate user level based on points
    calculateLevel(points) {
        const basePoints = 100;
        const pointsPerLevel = 150;
        
        if (points < basePoints) return 1;
        
        return Math.floor((points - basePoints) / pointsPerLevel) + 2;
    }

    // Get level progress percentage
    getLevelProgress(points) {
        const level = this.calculateLevel(points);
        const basePoints = 100;
        const pointsPerLevel = 150;
        
        if (level === 1) {
            return (points / basePoints) * 100;
        }
        
        const levelStartPoints = basePoints + (level - 2) * pointsPerLevel;
        const pointsInLevel = points - levelStartPoints;
        
        return (pointsInLevel / pointsPerLevel) * 100;
    }

    // Get available achievements for a category
    getAvailableAchievements(category) {
        return this.achievements[category] || [];
    }

    // Get all achievement categories
    getCategories() {
        return Object.keys(this.achievements);
    }

    // Get total possible points
    getTotalPossiblePoints() {
        let total = 0;
        Object.values(this.achievements).forEach(categoryAchievements => {
            categoryAchievements.forEach(achievement => {
                total += achievement.points;
            });
        });
        return total;
    }
}

// Export the achievement system
export const achievementSystem = new AchievementSystem();

// Example usage:
/*
document.addEventListener('DOMContentLoaded', async () => {
    // Check achievements when user catches a fish
    const userId = 'current-user-id';
    const catchCount = 5;
    const newAchievements = await achievementSystem.checkAchievements(userId, 'catches', catchCount);
    
    // Check achievements when user participates in an event
    const eventCount = 1;
    const eventAchievements = await achievementSystem.checkAchievements(userId, 'events', eventCount);
});
*/