/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Search Keyword Model
  // -------------
  
  var searchKeyword = Backbone.Model.extend({
    url: '/timetable/search/',
  });

  app.SearchKeyword = new searchKeyword;
})();
