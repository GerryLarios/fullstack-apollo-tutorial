const { RESTDataSource } = require('apollo-datasource-rest');

const launchReducer = (launch) => ({
  id: launch.id || 0,
  details: launch.details,
  cursor: `${launch.date_unix}`,
  mission: {
    name: launch.name,
    missionPatchSmall: launch.links.patch.small,
    missionPatchLarge: launch.links.patch.large,
  },
  rocket: {
    id: launch.rocket,
    name: launch.name,
    type: 'rocket',
  },
});

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v4/';
  }

  async getAllLaunches() {
    const response = await this.get('launches');
    if (!Array.isArray(response)) {
      return [];
    }
    return response.map(launchReducer);
  }

  async getLaunchById({ launchId }) {
    const response = await this.get('launches', { id: launchId });
    return launchReducer(response[0]);
  }

  getLaunchesByIds({ launchIds }) {
    return Promise.all(launchIds.map((launchId) => this.getLaunchById({ launchId })));
  }
}

module.exports = LaunchAPI;
