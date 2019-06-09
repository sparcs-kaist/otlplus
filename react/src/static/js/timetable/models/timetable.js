/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Timetable Model
  // ---------------
  
  app.TimetableSubSection = Backbone.Model.extend({
    defaults: {
      "lectures": [],
    },

    sync : function(){},
    save : function(){},
  });

  app.CurrentTimetable = new app.Timetable;
})();
