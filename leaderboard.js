import { Meteor } from 'meteor/meteor';
import { Template } from "meteor/templating";
import { Mongo } from "meteor/mongo";
import { Session } from "meteor/session";
import { Random } from "meteor/random";

const Scientists = new Mongo.Collection("scientists");
const Athletes = new Mongo.Collection("athletes");
const Actors = new Mongo.Collection("actors");

const CATEGORIES = {
  SCIENTISTS: 'scientists',
  ATHLETES: 'athletes',
  ACTORS: 'actors'
};

const POINTS = {
  SCIENTISTS: 5,
  ATHLETES: 10,
  ACTORS: 15
};

if (Meteor.isClient) {
  Template.leaderboard.helpers({
    characters: () => {
      const category = Template.instance().data.category;
      switch (category) {
        case CATEGORIES.SCIENTISTS:
          return Scientists.find({}, { sort: { score: -1, name: 1 } });
        case CATEGORIES.ATHLETES:
          return Athletes.find({}, { sort: { score: -1, name: 1 } });
        case CATEGORIES.ACTORS:
          return Actors.find({}, { sort: { score: -1, name: 1 } });
      }
    }
  });

  Template.character.helpers({
    selected () {
      return Session.equals("selectedCharacter", this._id) ? "selected" : '';
    }
  });

  Template.character.events({
    'click' () {
      const category = Template.parentData(1).category;
      let characterType;
      let points;

      switch (category) {
        case CATEGORIES.SCIENTISTS:
          characterType = 'scientist';
          points = POINTS.SCIENTISTS;
          break;
        case CATEGORIES.ATHLETES:
          characterType = 'athlete';
          points = POINTS.ATHLETES;
          break;
        case CATEGORIES.ACTORS:
          characterType = 'actor';
          points = POINTS.ACTORS;
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
    'click .inc' () {
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
    const initCollection = (collection, names) => {
      if (collection.find().count() === 0) {
        names.forEach(name => {
          collection.insert({
            name,
            score: Math.floor(Random.fraction() * 10) * 5
          });
        });
      }
    };

    initCollection(Scientists, ["Ada Lovelace", "Grace Hopper", "Marie Curie", "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"]);
    initCollection(Athletes, ["Usain Bolt", "Michael Phelps", "Serena Williams", "Simone Biles", "Lebron James", "Tom Brady"]);
    initCollection(Actors, ["Meryl Streep", "Tom Hanks", "Viola Davis", "Denzel Washington", "Cate Blanchett", "Leonardo DiCaprio"]);
  });
}
