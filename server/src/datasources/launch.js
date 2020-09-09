const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v4/';
  }

  async getAllLaunches() {
    const response = await this.get('launches');
    const isArray = Array.isArray(response);
    return isArray ? response.map(this.launchReducer) : [];
  }

  async getLaunchById({ launchId }) {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }

  getLaunchByIds({ launchIds }) {
    return Promise.all(launchIds.map((launchId) => this.getLaunchById({ launchId })));
  }

  static launchReducer(launch) {
    return {
      id: launch.id,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }
}

module.exports = LaunchAPI;
