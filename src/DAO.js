const { MongoClient } = require('mongodb');

module.exports = function(connection_string) {
  const client = new MongoClient(connection_string);
  const db = client.db('telegrambot');
  const users = db.collection('users');
  const meetups = db.collection('meetups');
  const sales = db.collection('sales');
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

  this.deleteMeetup = async function(speakerId, meetupName) {
    const res = await meetups.deleteMany({speakerId, title: meetupName});
    return res.deletedCount > 0;
  }

  this.getGodUserId = async function() {
    const list = await users.find().toArray();
    const user = list.filter(u => u.roles.includes('god'))?.at(0);
    return user.userId;
  }

  this.addSale = async function(sale) {
    await sales.insertOne(sale);
  }

  this.getSales = async function(userId) {
    return (await sales.find({userId}).toArray()).sort((a,b) => b.date - a.date);
  }

  this.getTop = async function() {
    const list = await sales.find({}).toArray();
    const res = {};
    list.forEach(el => {
      const key = el.userId;
      if(res[key]) {
        res[key].amount++;
        res[key].sum += el.price;
      } else {
        res[key] = {
          amount: 1,
          sum: el.price
        }
      }
    });
    return Object.keys(res).map(key => ({user: key, ...res[key]})).sort((a,b) => b.sum - a.sum);
  }

  return this;
}