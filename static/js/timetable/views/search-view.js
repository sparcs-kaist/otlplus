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
      this.listenTo(app.searchLectureList,
                    'update',
                    this.genListRender(app.searchLectureList, 'search'));
      this.listenTo(app.cartLectureList,
                    'update',
                    this.genListRender(app.cartLectureList, 'cart'));
      this.listenTo(app.majorLectureList,
                    'update',
                    this.genListRender(app.majorLectureList, 'major'));
      this.listenTo(app.humanityLectureList,
                    'update',
                    this.genListRender(app.humanityLectureList, 'humanity'));
      this.listenTo(app.YearSemester, 'change', this.fetchLists);
      app.YearSemester.set({year:2017, semester:1});
    },
    loadingMessage: '<div class="list-loading">'+(LANGUAGE_CODE==="en" ? "Loading" : "불러오는 중")+'</div>',
    noResultMessage: '<div class="list-loading">'+(LANGUAGE_CODE==="en" ? "No search results" : "결과 없음")+'</div>',

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

      $("#filter-time-day").val('');
      $("#filter-time-begin").val('');
      $("#filter-time-end").val('');
      $(".filter-time .type-elem label").html((LANGUAGE_CODE==="en" ? "Select" : "선택하기"));
    },

    searchTab: function (e) {
      $(this.el).find(".search-chead").removeClass('active');
      $(this.el).find(".search-chead.search").addClass('active');
      $(this.el).find("#result-pages").children().addClass("none");
      $(this.el).find(".search-page").removeClass("none");

      if (app.LectureActive.get("from") === "list") {
        app.LectureActive.set({type: "none"});
      }
      this.showSearch();
    },

    showSearch: function (e) {
      $(this.el).find(".search-extend").removeClass('none');
      $(this.el).find(".search-text").focus();
    },

    hideSearch: function (e) {
      this.clearSearch();
      $(this.el).find(".search-extend").addClass('none');
    },

    changeTab: function (e) {
      var tabName = $(e.currentTarget).attr('class').split(' ')[1];

      if ($(e.currentTarget).hasClass('active'))
        return;

      $(this.el).find(".search-chead").removeClass('active');
      $(e.currentTarget).addClass('active');
      $(this.el).find("#result-pages").children().addClass("none");
      $(this.el).find("." + tabName + "-page").removeClass("none");

      if(tabName==="search" && $('.search-page .list-scroll .list-elem').length===0) {
        this.showSearch()
      } else {
        this.hideSearch()
      }

      if (app.LectureActive.get("from") === "list") {
        app.LectureActive.set({type: "none"});
      }
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
        if (x.name==="keyword" || x.name==="day" |
            x.name==="begin" || x.name==="end") {
          data[x.name] = x.value;
        } else {
          if (data[x.name]) {
            data[x.name].push(x.value);
          } else {
            data[x.name] = [x.value];
          }
        }
      });
      data["year"] = app.YearSemester.attributes.year;
      data["semester"] = app.YearSemester.attributes.semester;

      $(".search-page .list-scroll").html(this.loadingMessage);
      this.hideSearch();

      app.SearchKeyword.set(data);
      app.SearchKeyword.save(null, {
        success: function(model, resp, options) {
          var lectures = [].concat.apply([], resp.courses); // Flatten double array to single array
          app.searchLectureList.reset(lectures);
          app.searchLectureList.trigger("update");

          $(".search-extend").addClass('none');
          
          if (app.LectureActive.get("from") === "list") {
            app.LectureActive.set({type: "none"});
          }
        },
        error: function(model, resp, options) {
          console.log("error" + resp.status);
        }
      });
    },

    fetchLists: function() {
      var options = {data: {year: app.YearSemester.get('year'),
                            semester: app.YearSemester.get('semester')},
                     type: 'POST'};

      $(".search-page .list-scroll").html('');
      this.showSearch();
      $(".result-text").text("검색");
      $(".cart-page .list-scroll").html(this.loadingMessage);
      app.cartLectureList.fetch(options);
      $(".major-page .list-scroll").html(this.loadingMessage);
      app.majorLectureList.fetch(options);
      $(".humanity-page .list-scroll").html(this.loadingMessage);
      app.humanityLectureList.fetch(options);
    },
 
    genListRender: function(lecList, name) {
    // Generates function that renders lecture list
      return function() {
        var template = _.template($('#list-template').html());
        var courses = _.groupBy(lecList.models, function(x){return x.get('old_code')});
        var block = $('.'+name+'-page').find('.list-scroll');
        if (lecList.length > 0) {
          block.html(template({courses:courses, cart:name==="cart"}));
        } else {
          block.html(this.noResultMessage);
        }

        // Disable add buttons
        block.find('.add-to-table').removeClass('disable');
        var lectures = app.CurrentTimetable.get('lectures');
        if (lectures)
          for (var i = 0, child; child = lectures[i]; i++) {
            $('.'+name+'-page [data-id='+child.id+'] .add-to-table').addClass('disable');
          }

        // Disable cart buttons
        block.find('.add-to-cart').removeClass('disable');
        var lectures = app.cartLectureList.models;
        if (lectures)
          for (var i = 0, child; child = lectures[i]; i++) {
            $('.'+name+'-page [data-id='+child.id+'] .add-to-cart').addClass('disable');
          }
      }
    }
  })



  app.YearSemesterView = Backbone.View.extend({
    el: '#semester',

    events: {
      'click #semester-prev': 'semesterPrev',
      'click #semester-next': 'semesterNext',
    },

    semesterPrev: function(e) {
      var year = app.YearSemester.get('year');
      var semester = app.YearSemester.get('semester');
      var semText = ['', (LANGUAGE_CODE==="en" ? "Spring" : "봄"),'', (LANGUAGE_CODE==="en" ? "Fall" : "가을")];
      if (semester === 1) {
        year = year - 1;
        semester = 3;
      } else {
        semester = 1;
      }
      app.YearSemester.set({year:year, semester:semester});
      $(this.el).find("#semester-text").html(year+' '+semText[semester]);
    },

    semesterNext: function(e) {
      var year = app.YearSemester.get('year');
      var semester = app.YearSemester.get('semester');
      var semText = ['', (LANGUAGE_CODE==="en" ? "Spring" : "봄"),'', (LANGUAGE_CODE==="en" ? "Fall" : "가을")];
      if (semester === 3) {
        year = year + 1;
        semester = 1;
      } else {
        semester = 3;
      }
      app.YearSemester.set({year:year, semester:semester});
      $(this.el).find("#semester-text").html(year+' '+semText[semester]);
    },
  })
})(jQuery);

var search = new app.LectureSearchView();
var yearSemesterView = new app.YearSemesterView();
