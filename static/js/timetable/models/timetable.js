/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Timetable Model
  // ---------------
  
  app.Timetable = Backbone.Model.extend({
    defaults: {
      "lectures": [],
    },

    sync : function(){},
    save : function(){},
  });

  app.CurrentTimetable = new app.Timetable;
})();
