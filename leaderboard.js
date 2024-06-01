import { Meteor } from 'meteor/meteor';
import { Template } from "meteor/templating";
import { Mongo } from "meteor/mongo";
import { Session } from "meteor/session";
import { Random } from "meteor/random";

const Scientists = new Mongo.Collection("scientists");
const Athletes = new Mongo.Collection("athletes");
const Actors = new Mongo.Collection("actors");

if (Meteor.isClient) {
  Template.leaderboard.helpers({
    characters: () => {
      const category = Template.instance().data.category;
      switch (category) {
        case 'scientists':
          return Scientists.find({}, { sort: { score: -1, name: 1 } });
        case 'athletes':
          return Athletes.find({}, { sort: { score: -1, name: 1 } });
        case 'actors':
          return Actors.find({}, { sort: { score: -1, name: 1 } });
      }
    }
  });

  Template.character.helpers({
    selected: function () {
      return Session.equals("selectedCharacter", this._id) ? "selected" : '';
    }
  });

  Template.character.events({
    'click': function () {
      const category = Template.parentData(1).category;
      let characterType;
      let points;

      switch (category) {
        case 'scientists':
          characterType = 'scientist';
          points = 5;
          break;
        case 'athletes':
          characterType = 'athlete';
          points = 10;
          break;
        case 'actors':
          characterType = 'actor';
          points = 15;
          break;
      }

      Session.set("selectedCharacter", this._id);
      Session.set("selectedName", this.name);
      Session.set('selectedCategory', characterType);
      Session.set('selectedPoints', points);
    }
  });

  Template.details.helpers({
    selectedName: () => Session.get("selectedName"),
    selectedCategory: () => Session.get('selectedCategory'),
    points: () => Session.get('selectedPoints'),
  });

  Template.details.events({
    'click .inc': () => {
      const category = Session.get('selectedCategory');
      const selectedCharacterId = Session.get("selectedCharacter");
      const points = Session.get('selectedPoints');
      switch (category) {
        case 'scientist':
          Scientists.update(selectedCharacterId, { $inc: { score: points } });
          break;
        case 'athlete':
          Athletes.update(selectedCharacterId, { $inc: { score: points } });
          break;
        case 'actor':
          Actors.update(selectedCharacterId, { $inc: { score: points } });
          break;
      }

    }
  });
}

// On server startup, create some characters if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Scientists.find().count() === 0) {
      const names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
                   "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"];
      names.forEach(function (name) {
        Scientists.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }

    if (Athletes.find().count() === 0) {
      const names = ["Usain Bolt", "Michael Phelps", "Serena Williams",
                   "Simone Biles", "Lebron James", "Tom Brady"];
      names.forEach(function (name) {
        Athletes.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }

    if (Actors.find().count() === 0) {
      const names = ["Meryl Streep", "Tom Hanks", "Viola Davis",
                   "Denzel Washington", "Cate Blanchett", "Leonardo DiCaprio"];
      names.forEach(function (name) {
        Actors.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }
  });
}
