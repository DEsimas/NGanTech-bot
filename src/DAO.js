const { MongoClient } = require('mongodb');

module.exports = function(connection_string) {
  const client = new MongoClient(connection_string);
  const db = client.db('telegrambot');
  const users = db.collection('users');
  const meetups = db.collection('meetups');
  client.connect();

  this.getUserRoles = async function(userId) {
    const user = await users.findOne({ userId });
    if(!user) await users.insertOne({userId, roles: ['user']});
    return user?.roles || ['user'];
  }

  this.createMeetup = async function(meetup) {
    meetups.insertOne(meetup);
  }

  this.getMeetups = async function() {
    const records = await meetups.find().toArray();
    const filtered = records.filter(el => el.date > new Date());
    filtered.sort((a,b) => a.date - b.date);
    return filtered;
  }

  return this;
}