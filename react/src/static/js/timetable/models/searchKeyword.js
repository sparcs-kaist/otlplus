/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Search Keyword Model
  // -------------
  
  var searchKeyword = Backbone.Model.extend({
    url: '/timetable/api/search/',

    _abortSave: function() {
      if (this._prevSave != undefined &&
          this._prevSave.readyState > 0 &&
          this._prevSave.readyState < 4) {
        this._prevSave.abort();
      }
    },

    save: function(attributes, options) {
    	this._abortSave();
      return this._prevSave = Backbone.Model.prototype.save.call(this, attributes, options);
    },
  });

  app.SearchKeyword = new searchKeyword;
})();
