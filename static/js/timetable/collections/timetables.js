/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Timetable Collection
  // --------------------
  
  // The collection of timetables is backed by a remote server.  
  var Timetables = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: app.Timetable,
    url: '/media/js/timetable/timetable1.json',

    getUserLectures: function() {
      var self = this;
      this.fetch({
        success: function() {
          self.trigger("successOnFetch");
        }
      });
    }

  });

  // Create
  app.timetables = new Timetables();
  //app.timetables.fetch();
  //app.timetables.fetch({
  //  success: function() {
  //    console.log("JSON file load was successful");
  //    for (var child of app.timetables.models) {
  //      //console.log(app.timetables.models[0].attributes));
  //      console.log(child.attributes);
  //    }
  //  }
  //});
  //console.log('app.timetables',app.timetables.models);
})();
