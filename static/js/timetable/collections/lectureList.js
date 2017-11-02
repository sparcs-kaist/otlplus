/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  var SomeLectureList = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: app.Lecture,

    initialize: function(url) {
      this.url = url;
    },

    comparator: function(item) {
      return [item.get('old_code'), item.get('class_no')];
    }
  });

  // Create
  app.searchLectureList = new SomeLectureList('');
  app.cartLectureList = new SomeLectureList('/timetable/api/wishlist_load/');
  app.majorLectureList = new SomeLectureList('/timetable/api/list_load_major/');
  app.humanityLectureList = new SomeLectureList('/timetable/api/list_load_humanity/');
})();
