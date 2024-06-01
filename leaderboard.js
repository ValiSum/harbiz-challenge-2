import { Meteor } from 'meteor/meteor';
import { Template } from "meteor/templating";
import { Mongo } from "meteor/mongo";
import { Session } from "meteor/session";
import { Random } from "meteor/random";

// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

const Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  Template.leaderboard.helpers({
    players: function () {
      return Players.find({}, { sort: { score: -1, name: 1 } });
    }
  });

  // Template.leaderboard.events({
  //   'click .inc': function () {
  //     Players.update(Session.get("selectedPlayer"), {$inc: {score: 5}});
  //   }
  // });

  Template.player.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : '';
    }
  });

  Template.player.events({
    'click': function () {
      const { category } = Template.parentData(1);

      Session.set("selectedPlayer", this._id);
      Session.set("selectedName", this.name);
      console.log(category);
      switch (category) {
        case 'scientists':
          Session.set('selectedCategory', 'scientist');
          Session.set('selectedPoints', 5);
          break;
        case 'athletes':
          Session.set('selectedCategory', 'athlete');
          Session.set('selectedPoints', 10);
          break;
        case 'actors':
          Session.set('selectedCategory', 'actor');
          Session.set('selectedPoints', 15);
          break;
      }
    }
  });

  Template.details.helpers({
    selectedName: () => Session.get("selectedName"),
    selectedCategory: () => Session.get('selectedCategory'),
    points: () => Session.get('selectedPoints'),
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      const names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
                   "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"];
      names.forEach(function (name) {
        Players.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }
  });
}
