const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');

class UserAPI extends DataSource {
  constructor(store) {
    super();
    this.store = store;
  }

  initialize(config) {
    this.context = config.context;
  }

  async findOrCreate({ email: emailArg }) {
    const email = (this.context && this.context.user) ? this.context.user.email : emailArg;
    if (!email || !isEmail.validate(email)) {
      return null;
    }
    const users = await this.store.users.findOrCreate({ where: { email } });
    return users && users[0] ? users[0] : null;
  }

  async bookTrips({ launchIds }) {
    const userId = this.context.user.id;
    if (!userId) {
      return null;
    }
    const responses = await Promise.all(launchIds.map((launchId) => this.bookTrip({ launchId })));
    return responses.filter((res) => res !== false);
  }

  async bookTrip({ launchId }) {
    const userId = this.context.user.id;
    const res = await this.store.trips.findOrCreate({ where: { userId, launchId } });
    return res && res.length ? res[0].get() : false;
  }

  async cancelTrip({ launchId }) {
    const userId = this.context.user.id;
    return !!this.store.trips.destroy({ where: { userId, launchId } });
  }

  async getLaunchByIdsByUser() {
    const userId = this.context.user.id;
    const trips = await this.store.trips.findAll({ where: { userId } });
    return (trips && trips.length) ? trips.map((trip) => trip.dataValues.launchId) : [];
  }

  async isBookedOnLaunch({ launchId }) {
    if (!this.context || !this.context.user) {
      return false;
    }
    const userId = this.context.user.id;
    const trips = await this.store.trips.findAll({ where: { userId, launchId } });
    return trips && trips.length > 0;
  }
}

module.exports = UserAPI;
