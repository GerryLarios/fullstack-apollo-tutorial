module.exports = {
  Query: {
    launches: (_, __, { dataSources }) => dataSources.launchAPI.getAllLaunches(),
    launch: (_, { id }, { dataSources }) => dataSources.launchAPI.getLaunchById({ id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser(),
  },
  Mutation: {
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreate({ email });
      if (!user) {
        return { success: false, token: '' };
      }
      return { success: true, token: Buffer.from(email).toString('base64') };
    },
    bookTrips: async (_, { launchIds }, { dataSources }) => {
      const results = await dataSources.userAPI.bookTrips({ launchIds });
      const launches = await dataSources.launchAPI.getLaunchesByIds({ launchIds });

      const isSame = results.length === launchIds.length;
      if (!isSame) {
        const notBookedLaunches = launchIds.filter((id) => !results.includes(id));
        return {
          success: isSame,
          message: `the following launches couldn't be booked: ${notBookedLaunches}`,
          launches,
        };
      }
      return {
        success: isSame,
        message: 'trips booked successfulyy',
        launches,
      };
    },
    cancelTrip: async (_, { launchId }, { dataSources }) => {
      const result = await dataSources.userAPI.cancelTrip({ launchId });

      if (!result) {
        return {
          success: false,
          message: 'Failed to cancel trip',
        };
      }
      const launch = await dataSources.launchAPI.getLaunchById({ launchId });
      return {
        success: true,
        message: 'trip cancelled',
        launches: [launch],
      };
    },
  },
};
