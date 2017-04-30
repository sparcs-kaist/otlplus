/* global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Lecture search View
  // -------------------
  app.LectureSearchView = Backbone.View.extend({
    el: '#search-container',
    initialize: function (opt) {
      $(this.el).find(".chkall").prop('checked', true);
    },

    events: {
      'click .search-chead.search': "toggleSearch",
      'click .chkall': "toggleType",
      'click .chkelem': "toggleType",
      'click #search-button': "searchStart",
    },

    toggleSearch: function (e) {
      $(this.el).find(".result-page").toggleClass('none');
      $(this.el).find(".search-page").toggleClass('none');
    },

    toggleType: function (e) {
      var target = $(e.target);
      var elems = target.parent().parent().find('.chkelem');
      var chkall = target.parent().parent().find('.chkall')[0];
      if (target.hasClass('chkelem')) {
        target.parent().find('.fa').toggleClass('none');
        var flag = 0;
        for (var i = 0, elem; elem = elems[i]; i++) {
          if ($(elem).prop('checked')) {
            flag = 1;
            break;
          }
        }
        if (flag === 1) {
          $(chkall).parent().find('.fa-check-circle-o').addClass('none');
          $(chkall).parent().find('.fa-circle-o').removeClass('none');
          $(chkall).prop('checked', false);
        } else {
          $(chkall).parent().find('.fa-check-circle-o').removeClass('none');
          $(chkall).parent().find('.fa-circle-o').addClass('none');
          $(chkall).prop('checked', true);
        }
      } else {
        for (var i = 0, elem; elem = elems[i]; i++) {
          $(elem).parent().find('.fa-check-circle-o').addClass('none');
          $(elem).parent().find('.fa-circle-o').removeClass('none');
          $(elem).prop('checked', false);
        }
        target.parent().find('.fa-check-circle-o').removeClass('none');
        target.parent().find('.fa-circle-o').addClass('none');
        target.prop('checked', true);
      }
    },
    searchStart: function(e) {
      var target = $(e.target);
      var data = {};
			target.parent().serializeArray().map(function(x){
        if (x.name === "keyword") {
          data[x.name] = x.value;
        } else {
          if (data[x.name]) {
            data[x.name].push(x.value);
          } else {
            data[x.name] = [x.value];
          }
        }
      });

      app.SearchKeyword.set(data);
      app.SearchKeyword.save(null, {
        success: function(model, resp, options) {
          console.log("success");
        },
        error: function(model, resp, options) {
          console.log("error" + resp.status);
        }
      });
    }
  })
})(jQuery);

var search = new app.LectureSearchView();
