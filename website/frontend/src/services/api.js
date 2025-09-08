// API service for handling all API requests
const API_BASE_URL = 'https://opulent-space-train-r4gvj76wqxjhxr77-3001.app.github.dev/api';

class ApiService {
  // Generic fetch method with error handling and retry mechanism
  async fetchApi(endpoint, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching ${endpoint} (attempt ${i + 1}/${retries}):`, error);
        if (i === retries - 1) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** i));
      }
    }
  }

  // Player stats endpoints
  async getPlayerWinRate(player) {
    return this.fetchApi(`player/${player}/wr`);
  }

  async getPlayerBO3WinRate(player) {
    return this.fetchApi(`player/${player}/bo3wr`);
  }

  async getPlayerBO3GamesWinRate(player) {
    return this.fetchApi(`player/${player}/bo3gameswr`);
  }

  async getPlayerLeadWinRate(player) {
    return this.fetchApi(`player/${player}/leadwr`);
  }

  async getPlayerPokemonWinRate(player) {
    return this.fetchApi(`player/${player}/pokemonwr`);
  }

  async getPlayerTeraWinRate(player) {
    return this.fetchApi(`player/${player}/tarawr`);
  }

  async getPlayerMatches(player) {
    return this.fetchApi(`player/${player}/matches`);
  }

  // Lead combination endpoint
  async getPlayerLeadCombinationWinRate(player, leadCombo) {
    return this.fetchApi(`player/${player}/lead-combination/${leadCombo}/winrate`);
  }

  // Fetch all player stats in parallel
  async getAllPlayerStats(player) {
    try {
      const endpoints = [
        `player/${player}/wr`,
        `player/${player}/bo3wr`,
        `player/${player}/bo3gameswr`,
        `player/${player}/leadwr`,
        `player/${player}/pokemonwr`,
        `player/${player}/tarawr`
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => 
          this.fetchApi(endpoint).catch(error => {
            console.error(`Failed to fetch ${endpoint}:`, error);
            return null; // Return null for failed requests
          })
        )
      );

      return {
        wr: responses[0]?.win_rate,
        games_played: responses[0]?.games_played,
        bo3wr: responses[1]?.bo3_win_rate,
        bo3_played: responses[1]?.games_played,
        bo3games: responses[2],
        leads: responses[3] || [],
        pokemon: responses[4] || [],
        tera: responses[5] || []
      };
    } catch (error) {
      console.error('Error fetching all player stats:', error);
      throw error;
    }
  }
}

export default new ApiService();