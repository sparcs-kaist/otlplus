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
      'click .result-message': "showSearch",
      'click #search-cancel': "hideSearch",
      'click .search-chead': "changeTab",
      'click .chkall': "toggleType",
      'click .chkelem': "toggleType",
      'click #search-button': "searchStart",
    },

    clearSearch: function () {
      $(this.el).find(".search-text").val('');

      $(this.el).find(".chkall").prop('checked', true);
      $(this.el).find(".chkall").parent().find('.fa-check-circle-o').removeClass('none');
      $(this.el).find(".chkall").parent().find('.fa-circle-o').addClass('none');

      $(this.el).find(".chkelem").prop('checked', false);
      $(this.el).find(".chkelem").parent().find('.fa-check-circle-o').addClass('none');
      $(this.el).find(".chkelem").parent().find('.fa-circle-o').removeClass('none');
    },

    showSearch: function (e) {
      this.clearSearch();
      $(this.el).find(".search-extend").removeClass('none');
      $(this.el).find(".search-text").focus();
    },

    hideSearch: function (e) {
        $(this.el).find(".search-extend").addClass('none');
      },

    changeTab: function (e) {
      var tabName = $(e.currentTarget).attr('class').split(' ')[1];

      if ($(e.currentTarget).hasClass('active'))
        return;

      $(this.el).find(".search-chead").removeClass('active');
      $(e.currentTarget).addClass('active');
      $(this.el).find(".search-extend").addClass("none");
      $(this.el).find("#result-pages").children().addClass("none");
      $(this.el).find("." + tabName + "-page").removeClass("none");
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
      target.parent().parent().serializeArray().map(function(x){
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
      data["year"] = 2016; // TODO : Change this to actual semester settings
      data["semester"] = 1; // TODO : Change this to actual semester settings

      app.SearchKeyword.set(data);
      app.SearchKeyword.save(null, {
        success: function(model, resp, options) {
          console.log("success");
          console.log(resp);
          var block = $(".search-page").find(".list-scroll");
          var template = _.template($('#list-template').html());

          app.searchLectureList.reset();
          for (var i=0; i<resp.courses.length; i++) {
            for (var j=0; j<resp.courses[i].length; j++) {
              app.searchLectureList.create(resp.courses[i][j]);
            }
          }

          block.children().remove();
          block.html(template(resp));

          $(".result-text").text(resp.search_text);
          $(".search-extend").addClass('none');
        },
        error: function(model, resp, options) {
          console.log("error" + resp.status);
        }
      });
    }
  })
})(jQuery);

var search = new app.LectureSearchView();
