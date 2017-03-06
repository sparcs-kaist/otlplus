/* global Backbone */
var app = app || {};

(function() {
  'use strict';

  // Timetable Router
  // ----------------
  var TimetableRouter = Backbone.Router.extend({
    routes: {
      ":page": "page"
    },

    page: function(page) {
      console.log("page", page);
      $('.timetable-tab.active').removeClass('active');
      $('.timetable-tab:nth-of-type(' + page + ')').addClass('active');
    }
  });
  app.TimetableRouter = new TimetableRouter();
  Backbone.history.start();
})();
