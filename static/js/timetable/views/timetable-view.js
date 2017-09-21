/* global Backbone */
var app = app || {};


// Set csrf token for ajax
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
var csrftoken = getCookie('csrftoken');
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


function findLecture(lectures, id) {
  if(lectures.length === 0){
    return undefined;
  } else if (lectures[0].attributes) {
    return _.find(lectures, function(x){return x.get('id')===id});
  } else {
    return _.find(lectures, function(x){return x.id===id});
  }
}


(function ($) {
  'use strict';

  // Timetable View
  // ---------------

  // Dragging timetable
  app.TimetableView = Backbone.View.extend({
    initialize: function (opt) {
      this.isLookingTable = false;
      this.isBubbling = false;
      this.isDragging = false; 
      this.isBlockClick = false;
      $(window).on("resize", this.render);
    },

    el: '#timetable-wrap',
    dragCell : '#drag-cell',

    events: {
      'touchstart .half.table-drag': "dragStart",
      'touchmove .half.table-drag': "dragMove",
      'touchend': "dragEnd",
      'touchstart .lecture-block': "clickBlock",
      'mousedown .half.table-drag': "dragStart",
      'mousemove .half.table-drag': "dragMove",
      'mouseup': "dragEnd",
      'mousedown .lecture-block': "clickBlock",

      'mouseover .lecture-block': "blockHover",
      'mouseout .lecture-block': "blockOut",
      'click': "blockClick",
      'click .lecture-delete': "deleteLecture",
    },

    dragStart: function (e) {
      if (this.isBubbling) {
        this.isBubbling = false;
      } else {
        e.stopPropagation();
        e.preventDefault();
        this.isDragging = true;
        $(this.dragCell).removeClass('none');

        this.firstBlock = $(e.currentTarget);
        this.secondBlock = $(e.currentTarget);
        this.render();
      }
    },

    dragMove: function (e) {
      if (this.isDragging) {
        this.secondBlock = $(e.currentTarget);
        this.render();
      }
    },

    dragEnd: function (e) {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.firstBlock[0] == this.secondBlock[0]) {
          $(this.dragCell).addClass('none');
        }
        else {
          this.searchLecture();
          $(this.dragCell).addClass('none');
        }
      }
    },

    clickBlock: function () {
      if (!this.isDragging) {
        this.isBubbling = true;
      }
    },

    searchLecture: function () {
      var day = this.indexOfDay(this.firstBlock.attr("data-day"));
      var fBTime = this.indexOfTime(this.firstBlock.attr("data-time"));
      var sBTime = this.indexOfTime(this.secondBlock.attr("data-time"));
      if (fBTime > sBTime) {
        var temp = fBTime;
        fBTime = sBTime;
        sBTime = temp;
      }
      sBTime += 1;
      if (LANGUAGE_CODE==="en")
        var dayStr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][day]
      else 
        var dayStr = ['월요일', '화요일', '수요일', '목요일', '금요일'][day]
      var fBStr = (Math.floor(fBTime/2)+8)+":"+(fBTime%2 ? "30" : "00")
      var sBStr = (Math.floor(sBTime/2)+8)+":"+(sBTime%2 ? "30" : "00")

      $("#filter-time-day").val(day);
      $("#filter-time-begin").val(fBTime);
      $("#filter-time-end").val(sBTime);
      $(".filter-time .type-elem label").html(dayStr+" "+fBStr+" ~ "+sBStr);
      $(".filter-time .type-elem label").addClass('time-active');
      searchView.searchTab();
    },

    // Return index of day
    // 'mon':0, 'tue':1, ..., 'sun':6
    indexOfDay: function (day) {
      var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      return days.indexOf(day);
    },
    
    // Return index of time
    // '800':0, '830':1, ..., '2330':31
    indexOfTime: function (time) {
      var time = parseInt(time);
      var firstTime = 800;
      time -= firstTime;
      
      var hour = Math.floor(time / 100);
      var min = time % 100;

      return hour*2 + min/30;
    },

    render: function () {
      if(timetableView.firstBlock) {
        var left = timetableView.firstBlock.offset().left - $(timetableView.el).offset().left - 1;
        var width = timetableView.firstBlock.width() + 2;
        var top = Math.min(timetableView.firstBlock.offset().top, timetableView.secondBlock.offset().top) - $(timetableView.el).offset().top + 2;
        var height = Math.abs(timetableView.firstBlock.offset().top - timetableView.secondBlock.offset().top) + timetableView.firstBlock.height() -2;

        $(timetableView.dragCell).css('left', left+'px');
        $(timetableView.dragCell).css('width', width+'px');
        $(timetableView.dragCell).css('top', top+'px');
        $(timetableView.dragCell).css('height', height+'px');
      }
    },


    blockHover: function (e) {
      if (app.LectureActive.get("type") !== "click" && !timetableView.isDragging) {
        var ct = $(e.currentTarget);
        var id = Number(ct.attr('data-id'));
        var lecList = app.CurrentTimetable.get('lectures');
        var lecture = findLecture(lecList, id);

        app.LectureActive.set({type: "hover",
                               from: "table",
                               lecture: lecture,});
      }
    },

    blockOut: function () {     
      if (app.LectureActive.get("type") !== "click" && !timetableView.isDragging) {
        app.LectureActive.set({type: "none"});
      }
    },

    blockClick: function (e) {
      var target = $(e.target);
      var block = target.closest('.lecture-block');
      var id = Number(block.attr('data-id'));

      if (block.length === 0) {
        // Click target is not child(or itself) of lecture block
        app.LectureActive.set({type: "none"});
      } else if (target.hasClass("lecture-delete")) {
        // Do nothing
      } else if (app.LectureActive.get('type') === 'click'
                 && app.LectureActive.get('from') === 'table'
                 && app.LectureActive.get('lecture').id === id) {
        app.LectureActive.set({type: "hover"});
      } else {
        var lecList = app.CurrentTimetable.get('lectures');
        var lecture = findLecture(lecList, id);

        app.LectureActive.set({type: "click",
                               from: "table",
                               lecture: lecture,});
      }
    },

    deleteLecture: function (e) {
      var ct = $(e.currentTarget);
      var lecture_id = Number(ct.closest('.lecture-block').attr('data-id'));
      var timetable_id = Number(app.CurrentTimetable.get('id'));

      // If lecture is not in timetable
      if (!findLecture(app.CurrentTimetable.get('lectures'), lecture_id)) {
        return;
      }

      $.ajax({
        url: "/timetable/api/table_update/",
        type: "POST",
        data: {
          table_id: timetable_id,
          lecture_id: lecture_id,
          delete: true,
        },
        success: function(result) {
          var lecList = app.CurrentTimetable.get('lectures');
          var lecture = findLecture(lecList, lecture_id);

          // Update app.CurrentTimetable
          var timetableLectures = app.CurrentTimetable.get('lectures');
          timetableLectures = _.filter(timetableLectures, function(x){return x.id!==lecture_id});
          app.CurrentTimetable.set('lectures', timetableLectures);

          // Update app.timetables
          var timetableModel = _.find(app.timetables.models, function(x){return x.get('id')===timetable_id});
          timetableModel.set('lectures', timetableLectures)
        },
      });
    },
  })

  // Actions in lecture list
  app.LectureListView = Backbone.View.extend({
    el: '#result-pages',
    initialize: function (opt) {
    },
      
    events: {
      'click .add-to-table': "addToTable",
      'click .add-to-cart': "addToCart",
      'click .delete-from-cart': "deleteFromCart",

      'mouseover .list-elem-body-wrap': "listHover",
      'mouseout .list-elem-body-wrap': "listOut",
      'click .list-elem-body-wrap': "listClick",
    },

    addToTable: function (e) {
      var ct = $(e.currentTarget);
      var lecture_id = Number(ct.closest('.list-elem-body-wrap').attr('data-id'));
      var timetable_id = Number(app.CurrentTimetable.get('id'));
      var lecList;
      switch (ct.closest('.list-page').attr('class').split(' ')[1]) {
        case 'search-page':
          lecList = app.searchLectureList;
          break;
        case 'cart-page':
          lecList = app.cartLectureList;
          break;
        case 'major-page':
          lecList = app.majorLectureList;
          break;
        case 'humanity-page':
          lecList = app.humanityLectureList;
          break;
      }
      var lecture = _.find(lecList.models, function(x){return x.get("id")===lecture_id});

      // If class time overlaps
      var overlap = false;
      for (var i=0, classtime; classtime=lecture.get('classtimes')[i]; i++) {
        var dayBlock = $('#timetable-contents').find('.day:nth-child('+ (classtime.day+2) + ')');
        var blocks = dayBlock.find('.half').slice((classtime.begin-480)/30, (classtime.end-480)/30);
        overlap = overlap || blocks.hasClass('occupied');
      }
      if (overlap) {
        alert('시간표가 겹치는 과목은 추가할 수 없습니다.');
        return;
      }
      // If lecture is already in timetable
      if (findLecture(app.CurrentTimetable.get('lectures'), lecture_id)) {
        return;
      }

      $.ajax({
        url: "/timetable/api/table_update/",
        type: "POST",
        data: {
          table_id: timetable_id,
          lecture_id: lecture_id,
          delete: false,
        },
        success: function(result) {

          // Update app.CurrentTimetable
          // app.timetables is automaticall updated because it has same array pointers
          app.CurrentTimetable.get('lectures').push(lecture.attributes);
          app.CurrentTimetable.trigger('change');
        },
      });
    },

    addToCart: function (e) {
      var ct = $(e.currentTarget);
      var lecture_id = Number(ct.closest('.list-elem-body-wrap').attr('data-id'));

      // If lecture is already in wishlist
      if (findLecture(app.cartLectureList.models, lecture_id)) {
        return;
      }

      $.ajax({
        url: "/timetable/api/wishlist_update/",
        type: "POST",
        data: {
          lecture_id: lecture_id,
          delete: false,
        },
        success: function(result) {
          var lecList;
          switch (ct.closest('.list-page').attr('class').split(' ')[1]) {
            case 'search-page':
              lecList = app.searchLectureList;
              break;
            case 'cart-page':
              lecList = app.cartLectureList;
              break;
            case 'major-page':
              lecList = app.majorLectureList;
              break;
            case 'humanity-page':
              lecList = app.humanityLectureList;
              break;
          }
          var lecture = _.find(lecList.models, function(x){return x.get("id")===lecture_id});

          // Update app.CartLectureList
          app.cartLectureList.create(lecture.attributes);
          app.cartLectureList.trigger('change');


          // Disable cart buttons
          $('[data-id='+lecture_id+'] .add-to-cart').addClass('disable');
        },
      });
    },

    deleteFromCart: function (e) {
      var ct = $(e.currentTarget);
      var lecture_id = Number(ct.closest('.list-elem-body-wrap').attr('data-id'));

      // If lecture is not in wishlist
      if (!findLecture(app.cartLectureList.models, lecture_id)) {
        return;
      }

      $.ajax({
        url: "/timetable/api/wishlist_update/",
        type: "POST",
        data: {
          lecture_id: lecture_id,
          delete: true,
        },
        success: function(result) {
          var lecList = app.cartLectureList;
          var lecture = _.find(lecList.models, function(x){return x.get("id")===lecture_id});

          // Update app.cartLectureList
          app.cartLectureList.remove(lecture);

          // Enable cart buttons
          $('[data-id='+lecture_id+'] .add-to-cart').removeClass('disable');
        },
      });
    },


    listHover: function (e) {
      if (app.LectureActive.get("type") !== "click") {
        var ct = $(e.currentTarget);
        var id = Number(ct.attr('data-id'));
        var lecList;
        switch (ct.closest('.list-page').attr('class').split(' ')[1]) {
          case 'search-page':
            lecList = app.searchLectureList;
            break;
          case 'cart-page':
            lecList = app.cartLectureList;
            break;
          case 'major-page':
            lecList = app.majorLectureList;
            break;
          case 'humanity-page':
            lecList = app.humanityLectureList;
            break;
        }
        var lecture = findLecture(lecList.models, id);

        app.LectureActive.set({type: "hover",
                               from: "list",
                               lecture: lecture.attributes,});
      }
    },

    listOut: function (e) {     
      if (app.LectureActive.get("type") !== "click") {
        app.LectureActive.set({type: "none"});
      }
    },

    listClick: function (e) {
      var target = $(e.target);
      var ct = $(e.currentTarget);
      var id = Number(ct.attr('data-id'));

      if (target.hasClass("add-to-table")
          || target.hasClass("add-to-cart")
          || target.hasClass("delete-from-cart")) {
        // Do nothing
      } else if (app.LectureActive.get('type') === 'click'
          && app.LectureActive.get('from') === 'list'
          && app.LectureActive.get('lecture').id === id) {
        app.LectureActive.set({type: "hover"});
      } else {
        var lecList;
        switch (ct.closest('.list-page').attr('class').split(' ')[1]) {
          case 'search-page':
            lecList = app.searchLectureList;
            break;
          case 'cart-page':
            lecList = app.cartLectureList;
            break;
          case 'major-page':
            lecList = app.majorLectureList;
            break;
          case 'humanity-page':
            lecList = app.humanityLectureList;
            break;
        }
        var lecture = findLecture(lecList.models, id);

        app.LectureActive.set({type: "click",
                               from: "list",
                               lecture: lecture.attributes,});
      }
    },
  })

  // Actions in lecture detail
  app.LectureDetailView = Backbone.View.extend({
    el: '#lecture-info',

    initialize: function () {
    },

    events: {
      'click .open-dict-button': "openDictPreview",
      'click .close-dict-button': "closeDictPreview",
      'click #fix-option': "unfix",
    },

    openDictPreview: function(e) {
      $('.lecture-detail .nano').nanoScroller({scrollTop: $('.open-dict-button').position().top - $('.nano-content > .basic-info:first-child').position().top + 1});
    },

    closeDictPreview: function(e) {
      $('.lecture-detail .nano').nanoScroller({scrollTop: 0});
    },

    fetchDict: function(e) {
      var block = $('.lecture-detail #reviews');

      $.ajax({
        url: "/timetable/api/comment_load/",
        type: "POST",
        data: {
          lecture_id: app.LectureActive.get('lecture').id,
        },
        success: function(result) {
          $('.lecture-detail .review-loading').remove();
          if (result.length == 0) {
            block.html('<div class="review-loading">'+(LANGUAGE_CODE==="en" ? "No results" : "결과 없음")+'</div>');
          } else {
            var template = _.template($('#comment-template').html());
            block.html(template({comments:result}));
          }
          $('.nano').nanoScroller();
        },
      });
    },

    scrollChange: function(e) {
      if($('.open-dict-button').position().top <= 1) {
        $('.dict-fixed').removeClass('none');
      } else {
        $('.dict-fixed').addClass('none');
      }
    },

    unfix: function(e) {
      app.LectureActive.set({type: "none"});
    },
  })

  // Showing lectures info of the semester
  app.SemesterLectureView = Backbone.View.extend({
    el: "#right-side",
    block: "#lecture-info",
    semesterTemplate: _.template($('#semester-lecture-template').html()),

    typeDict: {"Basic Required": "기초필수",
               "Basic Elective": "기초선택",
               "Major Required": "전공필수",
               "Major Elective": "전공선택",
               "Humanities & Social Elective": "인문사회선택",},
    dateDict: {"mon": (LANGUAGE_CODE==="en" ? "Monday" : "월요일"),
               "tue": (LANGUAGE_CODE==="en" ? "Tuesday" : "화요일"),
               "wed": (LANGUAGE_CODE==="en" ? "Wednesday" : "수요일"),
               "thu": (LANGUAGE_CODE==="en" ? "Thursday" : "목요일"),
               "fri": (LANGUAGE_CODE==="en" ? "Friday" : "금요일"),
               "sat": (LANGUAGE_CODE==="en" ? "Saturday" : "토요일"),
               "sun": (LANGUAGE_CODE==="en" ? "Sunday" : "일요일"),},

    events: {
      'mouseover .map-location-box': "buildingInfo",
      'mouseout .map-location-box': "clear",
      'mouseover .lecture-type': "typeInfo",
      'mouseout .lecture-type': "clear",
      'mouseover .lecture-type-right': "typeInfo",
      'mouseout .lecture-type-right': "clear",
      'mouseover .total-credit': "creditInfo",
      'mouseout .total-credit': "clear",
      'mouseover .examtime': "examInfo",
      'mouseout .examtime': "clear",
    },

    initialize: function() {},

    clear: function() {
      if (app.LectureActive.get("type") === "none") {
        $(".map-location-box").removeClass('active');
        $('.map-location-circle').removeClass('active');

        $(".lecture-detail").remove();
        $(".lecture-block").removeClass("active");

        $('.credit-text').removeClass('active');

        $('.total-credit .normal').removeClass('none');
        $('.total-credit .active').addClass('none');

        $('.exam-box').removeClass('active');
      }
    },

    _formatLectures: function(lectureIDs, getInfo) {
      var lectures = app.CurrentTimetable.get('lectures');
      var result = [];
      for (var i=0, id; id=lectureIDs[i]; i++) {
        var lecture = findLecture(lectures, id);
        result.push({title: lecture.title,
                     info: getInfo(lecture)});
        $(".lecture-block[data-id="+id+"]").addClass('active');
      }
      return result;
    },

    buildingInfo: function(e) {
      if (app.LectureActive.get("type") === "none") {
        var buildingNo = $(e.currentTarget).closest(".map-location").attr("data-building");
        var title = buildingNo;
        var circles = $(e.currentTarget).find(".map-location-circle");
        var lectureIDs = $.map(circles,
                               function(x){return Number($(x).attr("data-id"))});
        var lectures = this._formatLectures(lectureIDs,
                          function(x){return x.room});

        // Highlight target
        $(e.currentTarget).addClass('active');
        $(e.currentTarget).find('.map-location-circle').addClass('active');

        $(this.block).append(this.semesterTemplate({title: title,
                                                  lectures: lectures,}));
      }
    },

    typeInfo: function(e) {
      if (app.LectureActive.get("type") === "none") {
        var type = $(e.currentTarget).attr('data-type');
        if (type !== "Etc") {
          var title = (LANGUAGE_CODE==="en" ? type : this.typeDict[type]);
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return x.type_en===type});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return (x.credit? x.credit+(LANGUAGE_CODE==="en" ? " credits" : "학점") : "") + (x.credit_au? x.credit_au+"AU" : "")});

          // Highlight target
          $(e.currentTarget).find('.credit-text').addClass('active');
        } else {
          var title = (LANGUAGE_CODE==="en" ? "Others" : "기타");
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return !semesterLectureView.typeDict[x.type_en]});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return (x.credit? x.credit+(LANGUAGE_CODE==="en" ? " credits" : "학점") : "") + (x.credit_au? x.credit_au+"AU" : "")});

          // Highlight target
          $(e.currentTarget).find('.credit-text').addClass('active');
        }
        $(this.block).append(this.semesterTemplate({title: title,
                                                  lectures: lectures,}));
      }
    },

    creditInfo: function(e) {
      if (app.LectureActive.get("type") === "none") {
        var type = $(e.currentTarget).find('.score-text').attr('id');
        if (type === "au") {
          var title = "AU";
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return x.credit_au>0});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return x.credit_au+"AU"});

          // Highlight target
          $('#au .active').html($('#au .normal').html());
          $('#au .normal').addClass('none');
          $('#au .active').removeClass('none');
        } else {
          var title = (LANGUAGE_CODE==="en" ? " Credits" : "학점");
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return x.credit>0});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return x.credit+(LANGUAGE_CODE==="en" ? " credits" : "학점")});

          // Highlight target
          $('#credits .active').html($('#credits .normal').html());
          $('#credits .normal').addClass('none');
          $('#credits .active').removeClass('none');
        }
        $(this.block).append(this.semesterTemplate({title: title,
                                                  lectures: lectures,}));
      }
    },

    examInfo: function(e) {
      if (app.LectureActive.get("type") === "none") {
        var date = $(e.currentTarget).attr('data-date');
        var title = this.dateDict[date] + (LANGUAGE_CODE==="en" ? " Exam" : " 시험");
        var boxes = $(e.currentTarget).find('.exam-box');
        var lectureIDs = $.map(boxes,
                               function(x){return Number($(x).attr("data-id"))});
        var lectures = this._formatLectures(lectureIDs,
                          function(x){return x.exam.substr(x.exam.indexOf(" ") + 1)});

        // Highlight target
        boxes.addClass("active");

        $(this.block).append(this.semesterTemplate({title: title,
                                                  lectures: lectures,}));
      }
    },
  })

  // Fetching and changing timetable tabs
  app.TimetableTabView = Backbone.View.extend({
    el: '#timetable-tabs',

    template: _.template($('#timetable-lecture-template').html()),
    examTemplate: _.template($('#exam-template').html()),

    events: {
      'click .timetable-tab': "changeTab",
      'click .timetable-add': "createTable",
      'click .duplicate-table': "copyTable",
      'click .delete-table': "deleteTable",
    },

    initialize: function() {
      _.bindAll(this,"render");
      $(window).on("resize", this.resize);
      this.listenTo(app.CurrentTimetable, 'change', this.render);
      this.listenTo(app.timetables, 'update', this.makeTab);
      this.listenTo(app.YearSemester, 'change', this.fetchTab);
    },

    fetchTab: function() {
      var options = {data: {year: app.YearSemester.get('year'),
                            semester: app.YearSemester.get('semester')},
                    type: 'POST'};
      $('#timetable-tabs').html('<a href="#/1" class="timetable-tab" style="pointer-events:none;"><span class="timetable-num">불러오는 중</span></a>');
      app.timetables.fetch(options);
    },

    makeTab: function() {
      app.CurrentTimetable.set(app.timetables.models[0].attributes);
      // this.render is automatically called here

      var template = _.template($('#timetable-tab-template').html());
      var block = $('#timetable-tabs');
      block.html(template({ids : app.timetables.pluck('id')}));
      block.children().first().addClass('active');
    },

    changeTab: function(e) {
      var id = Number($(e.currentTarget).attr('data-id'));
      var timetable = findLecture(app.timetables.models, id);
      app.CurrentTimetable.set(timetable.attributes);
      // this.render is automatically called here
    },

    deleteTable: function(e) {
      if (app.timetables.length <= 1){
        alert("마지막 시간표는 삭제할 수 없습니다");
        return;
      }
      if (!confirm("정말 삭제하시겠습니까?\n이 동작은 취소하거나 되돌릴 수 없습니다.")){
        return;
      }

      var block = $(e.currentTarget).closest('.timetable-tab');
      var id = Number(block.attr('data-id'));

      $.ajax({
        url: "/timetable/api/table_delete/",
        type: "POST",
        data: {
          table_id: id,
          year: app.YearSemester.get('year'),
          semester: app.YearSemester.get('semester'),
        },
        success: function(result) {
          var timetables = _.filter(app.timetables.models, function(x){return x.get('id')!==id});
          app.timetables.reset(timetables);
          app.timetables.trigger('update');
        },
      });
    },

    createTable: function(e) {
      $.ajax({
        url: "/timetable/api/table_create/",
        type: "POST",
        data: {
          year: app.YearSemester.get('year'),
          semester: app.YearSemester.get('semester'),
        },
        success: function(result) {
          app.timetables.create({id: result.id,
                                 year: app.YearSemester.get('year'),
                                 semester: app.YearSemester.get('semester'),
                                 lectures: []});
          var newTable = _.find(app.timetables.models, function(x){return x.get('id')===result.id});
          app.CurrentTimetable.set(newTable.attributes);
        },
      });
    },

    copyTable: function(e) {
      var block = $(e.currentTarget).closest('.timetable-tab');
      var id = Number(block.attr('data-id'));

      $.ajax({
        url: "/timetable/api/table_copy/",
        type: "POST",
        data: {
          table_id: id,
          year: app.YearSemester.get('year'),
          semester: app.YearSemester.get('semester'),
        },
        success: function(result) {
          var oldTable = _.find(app.timetables.models, function(x){return x.get('id')===id});
          app.timetables.create({id: result.id,
                                 year: app.YearSemester.get('year'),
                                 semester: app.YearSemester.get('semester'),
                                 lectures: _.clone(oldTable.get('lectures')),
                               });
          var newTable = _.find(app.timetables.models, function(x){return x.get('id')===result.id});
          app.CurrentTimetable.set(newTable.attributes);
        },
      });
    },

    render: function() {
      var lectures = app.CurrentTimetable.get('lectures')

      // Highlight selected timetable tab
      var id = app.CurrentTimetable.get('id');
      $('.timetable-tab').removeClass('active');
      $('.timetable-tab[data-id='+id+']').addClass('active');

      // Make timetable blocks
      $('#timetable-contents .lecture-block').remove();
      $('#timetable-contents .half').removeClass('occupied');
      var noTime = 0;
      for (var i = 0, child; child = lectures[i]; i++) {
        if (child.classtimes.length > 0) {
          for (var j=0, classtime; classtime=child.classtimes[j]; j++) {
            var dayVal = classtime.day + 2;
            var beginVal = (classtime.begin - 480) / 30;
            var endVal = (classtime.end - 480) / 30;
            var time = endVal - beginVal;

            var dayBlock = $('#timetable-contents').find('.day:nth-child('+ dayVal + ')');
            var blocks = dayBlock.find('.half').slice(beginVal, endVal);
            $(blocks[0]).append(this.template({title: child.title,
                                        id: child.id,
                                        professor: child.professor_short,
                                        classroom: classtime.classroom_short,
                                        color: child.course%16+1,
                                        cells: time,
                                        occupied: [],
                                        temp: false,}));
            blocks.addClass('occupied');
          }
        } else {
          var block = $('#timetable-contents')
                        .find('.day:nth-child('+(noTime+2)+')')
                        .find('.half.no-time');
          noTime++;
          block.append(this.template({title: child.title,
                                      id: child.id,
                                      professor: child.professor_short,
                                      classroom: child.classroom_short,
                                      color: child.course%16+1,
                                      cells: 3,
                                      occupied: [],
                                      temp: false,}));
        }
      }

      // Update credit info
      var credit=0, au=0;
      var byType=[0,0,0,0,0,0];
      for (var i = 0, child; child = lectures[i]; i++) {
        credit += child.credit;
        au += child.credit_au;
        switch (child.type_en) {
          case ('Basic Required'):
            byType[0] += child.credit+child.credit_au;
            break;
          case ('Basic Elective'):
            byType[1] += child.credit+child.credit_au;
            break;
          case ('Major Required'):
            byType[2] += child.credit+child.credit_au;
            break;
          case ('Major Elective'):
            byType[3] += child.credit+child.credit_au;
            break;
          case ('Humanities & Social Elective'):
            byType[4] += child.credit+child.credit_au;
            break;
          default:
            byType[5] += child.credit+child.credit_au;
        }
      }
      $('#credits .normal').html(credit);
      $('#au .normal').html(au);
      $('.lecture-type[data-type="Basic Required"]').find('.credit-text').html(byType[0]);
      $('.lecture-type-right[data-type="Basic Elective"]').find('.credit-text').html(byType[1]);
      $('.lecture-type[data-type="Major Required"]').find('.credit-text').html(byType[2]);
      $('.lecture-type-right[data-type="Major Elective"]').find('.credit-text').html(byType[3]);
      $('.lecture-type[data-type="Humanities & Social Elective"]').find('.credit-text').html(byType[4]);
      $('.lecture-type-right[data-type="Etc"]').find('.credit-text').html(byType[5]);

      // Update score
      var grade=0.0, load=0.0, speech=0.0;
      var targetNum=0;
      for (var i = 0, child; child = lectures[i]; i++) {
        if (child.has_review) {
          var num = child.credit + child.credit_au;
          targetNum += num;
          grade += child.grade * num;
          load += child.load * num;
          speech += child.speech * num;
        }
      }
      if (targetNum > 0) {
        var letters = ['?', '?', '?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
        $('#grades.score-text').html(letters[Math.round(grade/targetNum)]);
        $('#loads.score-text').html(letters[Math.round(load/targetNum)]);
        $('#speeches.score-text').html(letters[Math.round(speech/targetNum)]);
      } else {
        $('#grades.score-text').html('?');
        $('#loads.score-text').html('?');
        $('#speeches.score-text').html('?');
      }

      // Delete lectureactive if not in new timetable
      if (app.LectureActive.get('from')==='table') {
        var activeID = app.LectureActive.get('lecture').id
         if (!findLecture(lectures, activeID)) {
          app.LectureActive.set({'type': 'none'});
        }
      }

      // Disable add buttons
      $('.add-to-table').removeClass('disable');
      for (var i = 0, child; child = lectures[i]; i++) {
        $('[data-id='+child.id+'] .add-to-table').addClass('disable');
      }

      // Update map
      $('#map-container').find('.map-location-circle').remove();
      $('#map-container').find('.map-location').addClass('none');
      for (var i = 0, child; child = lectures[i]; i++) {
        if (child.building) {
          var location = child.building.split('-')[0];
          var block = $('#map-container').find('.map-location.'+location);
          block.removeClass('none');
          block.find('.map-location-box').append('<span class="map-location-circle color'+(child.course%16+1)+'" data-id='+child.id+'></span>');
        }
      }

      // Update exam info
      $('#examtable').find('.exam-box').remove();
      for (var i = 0, child; child = lectures[i]; i++) {
        for (var j=0, exam; exam=child.examtimes[j]; j++) {
          var date = ['mon', 'tue', 'wed', 'thu', 'fri'][exam.day];
          var block = $('#examtable').find('.examtime[data-date="'+date+'"] .examlist');
          block.append(this.examTemplate({id: child.id,
                                          title: child.title,
                                          examTime: exam.str.substr(exam.str.indexOf(" ") + 1),
                                          startTime: exam.begin,
                                          temp: false,}));
        }
      }

      // Update active lecture
      app.LectureActive.trigger("change");
    }
  })

  app.SearchView = Backbone.View.extend({
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
    },
    loadingMessage: '<div class="list-loading">'+(LANGUAGE_CODE==="en" ? "Loading" : "불러오는 중")+'</div>',
    noResultMessage: '<div class="list-loading">'+(LANGUAGE_CODE==="en" ? "No results" : "결과 없음")+'</div>',

    events: {
      'click .result-message': "showSearch",
      'click #search-cancel': "hideSearch",
      'click .search-chead': "changeTab",
      'click .chkall': "toggleType",
      'click .chkelem': "toggleType",
      'click .time-active': "clearTime",
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

      this.clearTime();
    },

    clearTime: function() {
      $("#filter-time-day").val('');
      $("#filter-time-begin").val('');
      $("#filter-time-end").val('');
      $(".filter-time .type-elem label").html((LANGUAGE_CODE==="en" ? "Drag timetable" : "시간표에서 드래그"));
      $(".filter-time .type-elem label").removeClass('time-active');
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
      if (tabName !== "major")
        $(this.el).find("." + tabName + "-page").removeClass("none");
      else
        $(this.el).find("." + tabName + "-page[data-code='" + $(e.currentTarget).attr('data-code') + "']").removeClass("none");


      if(tabName==="search" && $('.search-page .list-scroll .list-elem').length===0) {
        this.showSearch()
      } else {
        this.hideSearch()
      }

      if (app.LectureActive.get("from") === "list") {
        app.LectureActive.set({type: "none"});
      }
      $(".nano").nanoScroller();
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
      $(".nano").nanoScroller();

      app.SearchKeyword.set(data);
      app.SearchKeyword.save(null, {
        success: function(model, resp, options) {
          var lectures = resp.courses; // Flatten double array to single array
          app.searchLectureList.reset(lectures);
          app.searchLectureList.trigger("update");

          if (resp.too_many)
            alert((LANGUAGE_CODE==="en" ? "Too many search results are found. Only " : "검색 결과가 너무 많습니다. ")
                  +lectures.length
                  +(LANGUAGE_CODE==="en" ? " lectures are shown." : "개만 표시됩니다."));

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
      $(".cart-page .list-scroll").html(this.loadingMessage);
      app.cartLectureList.fetch(options);
      $(".major-page .list-scroll").html(this.loadingMessage);
      app.majorLectureList.fetch(options);
      $(".humanity-page .list-scroll").html(this.loadingMessage);
      app.humanityLectureList.fetch(options);
      $(".nano").nanoScroller();
    },
 
    genListRender: function(lecList, name) {
    // Generates function that renders lecture list
      return function() {
        var template = _.template($('#list-template').html());
        var models = lecList.models;
        var block;
        var courses;
        if (name !== 'major') {
          block = $('.'+name+'-page').find('.nano-content');

          courses = _.groupBy(models, function(x){return x.get('old_code')});
          if (models.length > 0) {
            block.html(template({courses:courses, cart:name==="cart"}));
          } else {
            block.html(this.noResultMessage);
          }
        } else {
          var majors = $.map($('.search-chead.major'), function(x){return $(x).attr('data-code')});
          for (var i=0,code; code=majors[i]; i++) {
            block = $('.'+name+'-page[data-code="'+code+'"]').find('.nano-content');
            if (code === 'Basic') {
              models = _.filter(lecList.models,
                                function(x) {
                                  return (x.get('type_en')==='Basic Required')
                                         ||(x.get('type_en')==='Basic Elective')});
            } else {
              models = _.filter(lecList.models,
                                function(x) {
                                  return (x.get('department_code')===code)
                                         &&((x.get('type_en')==='Major Required')
                                            ||(x.get('type_en')==='Major Elective'))});
            }

            courses = _.groupBy(models, function(x){return x.get('old_code')});
            if (models.length > 0) {
              block.html(template({courses:courses, cart:name==="cart"}));
            } else {
              block.html(this.noResultMessage);
            }
          }
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

        $(".nano").nanoScroller();
      }
    }
  })

  // Showing informations of target lecture
  app.LectureActiveListenerView = Backbone.View.extend({
    el: '#lecture-info',
    tagName: 'div',

    detailTemplate: _.template($('#lecture-detail-template').html()),
    blockTemplate: _.template($('#timetable-lecture-template').html()),
    examTemplate: _.template($('#exam-template').html()),

    initialize: function () {
      this.listenTo(app.LectureActive, 'change', this.changeInfo);
    },

    changeInfo: function () {
      if (app.LectureActive.get("type") === "none") {
        this.deleteInfo();
      } else {
        this.deleteInfo();
        this.render();
      }
    },

    deleteInfo: function () {
      // Delete lecture detail
      $('#lecture-info').find('.lecture-detail').remove();

      // Delete credit info
      $('#info').find('.active-credit').html("");
      $('#info').find('#credits .normal').removeClass("none");
      $('#info').find('#credits .active').addClass("none");
      $('#info').find('#au .normal').removeClass("none");
      $('#info').find('#au .active').addClass("none");

      // Clear list highlight
      $('.list-elem-body-wrap').removeClass('active');
      $('.list-elem-body-wrap').removeClass('click');

      // clear timetable blocks highlight
      $('.lecture-block').removeClass('active');
      $('.lecture-block').removeClass('click');
      $('.lecture-block-temp').remove();

      // Delete map info
      $('#map-container').find('.map-location-circle').removeClass("active");
      $('#map-container').find(".map-location-box").removeClass("active");
      var blocks = $('#map-container').find('.map-location-circle.temp').closest('.map-location');
      $('#map-container').find('.map-location-circle.temp').remove();
      for (var i=0, block; block=blocks[i]; i++)
        if ($(block).children().children().length <= 1)
          $(block).addClass('none');

      // Delete exam info
      $('#examtable').find('.exam-box').removeClass('active');
      $('#examtable').find('.exam-box.temp').remove();
    },

    render: function () {
      var lecture = _.clone(app.LectureActive.get('lecture'));
      var child = lecture;
      var id = Number(lecture.id);
      var inTimetable = findLecture(app.CurrentTimetable.get('lectures'), id);
      var idx = app.CurrentTimetable.get('lectures').length;

      // Show lecture detail
      $('#lecture-info').append(this.detailTemplate(lecture));
      if (app.LectureActive.get('type') === 'click') {
        $(".lecture-options #fix-option").removeClass('disable');
        $('.lecture-detail #reviews').html('<div class="review-loading">'+(LANGUAGE_CODE==="en" ? "Loading" : "불러오는 중")+'</div>');
        lectureDetailView.fetchDict();
        lectureDetailView.openDictPreview();
      }
      $(".nano").nanoScroller();
      $(this.el).find(".nano-content").bind("scroll", lectureDetailView.scrollChange);

      // Update credit info
      var typeDiv = $('#info').find("[data-type='" + lecture.type_en + "']");
      if (typeDiv.length === 0) {
        typeDiv = $('#info').find("[data-type='Etc']");
      }
      var credit = Number(lecture.credit);
      var au = Number(lecture.credit_au);
      var type_text, credit_text, au_text;
      if (inTimetable) {    // Lecture in timetable
        type_text = "(" + (credit+au) + ")";
        credit_text = Number($('#info').find("#credits .normal").html());
        au_text = Number($('#info').find("#au .normal").html());
      } else {         // Lecture not in timetable
        type_text = "+" + (credit + au);
        credit_text = Number($('#info').find("#credits .normal").html()) + credit;
        au_text = Number($('#info').find("#au .normal").html()) + au;
      }
      typeDiv.find('.active-credit').html(type_text);
      if (credit !== 0) {
        $('#info').find("#credits .active").html(String(credit_text));
        $('#info').find("#credits .normal").addClass("none");
        $('#info').find("#credits .active").removeClass("none");
      }
      if (au !== 0) {
        $('#info').find("#au .active").html(String(au_text));
        $('#info').find("#au .normal").addClass("none");
        $('#info').find("#au .active").removeClass("none");
      }

      // Highlight list
      if (app.LectureActive.get('from') === 'list') {
        if (app.LectureActive.get('type')==='hover') {
          $('.list-elem-body-wrap[data-id=' + lecture.id + ']').addClass('active');
        }
        if (app.LectureActive.get('type')==='click') {
          $('.list-elem-body-wrap[data-id=' + lecture.id + ']').addClass('click');
        }
      }

      // Highlight timetable blocks
      if (app.LectureActive.get('type')==='click' && app.LectureActive.get('from')==='list') {
        // Do nothing
      } else if (inTimetable) {
        if (app.LectureActive.get('type')==='hover') {
          $('.lecture-block[data-id=' + lecture.id + ']').addClass('active');
        }
        if (app.LectureActive.get('type')==='click') {
          $('.lecture-block[data-id=' + lecture.id + ']').addClass('click');
        }
      } else {
        var noTime = _.filter(app.CurrentTimetable.get('lectures'), function(x){x.classtimes.length===0}).length;
        if (child.classtimes.length > 0) {
          for (var j=0, classtime; classtime=child.classtimes[j]; j++) {
            var dayVal = classtime.day + 2;
            var beginVal = (classtime.begin - 480) / 30;
            var endVal = (classtime.end - 480) / 30;
            var time = endVal - beginVal;

            var dayBlock = $('#timetable-contents').find('.day:nth-child('+ dayVal + ')');
            var blocks = dayBlock.find('.half').slice(beginVal, endVal);

            var occupied = [];
            var start = 0;
            for (var i=0, block; block=blocks[i]; i++) {
              if ($(block).hasClass("occupied")) {
                start = start || i+1;
              } else{
                if (start) {
                  occupied.push([start-1, i-start+1]);
                }
                start = 0;
              }
            }
            if (start) {
              occupied.push([start-1, time-start+1]);
            }

            $(blocks[0]).append(this.blockTemplate({title: child.title,
                                        id: child.id,
                                        professor: child.professor_short,
                                        classroom: classtime.classroom_short,
                                        color: child.course%16+1,
                                        cells: time,
                                        occupied: occupied,
                                        temp: true,}));
          }
        } else {
          var block = $('#timetable-contents')
                        .find('.day:nth-child('+(noTime+2)+')')
                        .find('.half.no-time');
          noTime++;
          block.append(this.blockTemplate({title: child.title,
                                           id: child.id,
                                           professor: child.professor_short,
                                           classroom: child.classroom_short,
                                           color: child.course%16+1,
                                           cells: 3,
                                           occupied: [],
                                           temp: true,}));
        }
      }

      // Update map
      if (inTimetable) {
        var circle = $('#map-container').find(".map-location-circle[data-id="+id+"]");
        circle.addClass("active");
        circle.closest(".map-location-box").addClass("active");
      } else if (lecture.building) {
        var location = child.building.split('-')[0];
        var cont = $('#map-container').find('.map-location.'+location);
        var box = cont.find('.map-location-box');
        cont.removeClass('none');
        box.addClass('active');
        box.append('<span class="map-location-circle color'+(child.course%16+1)+' active temp" data-id='+child.id+'></span>');
      }

      // Update exam info
      if (inTimetable) {
        $('#examtable').find('.exam-box[data-id='+id+']').addClass('active');
      } else {
        for (var j=0, exam; exam=child.examtimes[j]; j++) {
          var date = ['mon', 'tue', 'wed', 'thu', 'fri'][exam.day];
          var block = $('#examtable').find('.examtime[data-date="'+date+'"] .examlist');
          block.append(this.examTemplate({id: child.id,
                                          title: child.title,
                                          examTime: exam.str.substr(exam.str.indexOf(" ") + 1),
                                          startTime: exam.begin,
                                          temp: true,}));
          $('.nano').nanoScroller();
        }
      }
    },
  })

  app.YearSemesterListenerView = Backbone.View.extend({
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

var timetableView = new app.TimetableView();
var lectureListView = new app.LectureListView();
var lectureDetailView = new app.LectureDetailView();
var semesterLectureView = new app.SemesterLectureView();
var timetableTabView = new app.TimetableTabView();
var searchView = new app.SearchView();
var lectureActiveListenerView = new app.LectureActiveListenerView();
var yearSemesterListenerView = new app.YearSemesterListenerView();

