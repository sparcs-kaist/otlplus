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

  // Actions in timetable
  app.TimetableView = Backbone.View.extend({
    initialize: function (opt) {
      this.isLookingTable = false;
      this.isBubbling = false;
      this.isDragging = false;
      this.isBlockClick = false;
      $(window).on("resize", this.resize);
    },

    el: '#timetable-wrap',
    dragCell : '#drag-cell',
    blockTemplate: _.template($('#timetable-lecture-template').html()),

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
        this.resize();
      }
    },

    dragMove: function (e) {
      if (this.isDragging) {
        this.secondBlock = $(e.currentTarget);
        this.resize();
      }
    },

    dragEnd: function (e) {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.firstBlock[0] == this.secondBlock[0]) {
          $(this.dragCell).addClass('none');
        }
        else {
          this._searchLecture();
          $(this.dragCell).addClass('none');
        }
      }
    },

    clickBlock: function () {
      if (!this.isDragging) {
        this.isBubbling = true;
      }
    },

    _searchLecture: function () {
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

      $("#search-filter-time-day").val(day);
      $("#search-filter-time-begin").val(fBTime);
      $("#search-filter-time-end").val(sBTime);
      $(".search-filter-time .search-filter-elem label").html(dayStr+" "+fBStr+" ~ "+sBStr);
      $(".search-filter-time .search-filter-elem label").addClass('search-filter-time-active');
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

    resize: function () {
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

      timetableView._sizeBlock($(".lecture-block"));
    },

    _sizeBlock: function(blocks) {
      var cell = $("#timetable-wrap").find(".half").first();
      var cellHeight = cell.height()+1;

      blocks.each(function() {
        var block = $(this);
        block.css('height', (cellHeight * block.attr('data-size') - 3) + 'px');
        block.find(".lecture-occupied").each(function() {
          var occBlock = $(this);
          occBlock.css('top', (cellHeight * occBlock.attr('data-pos')) + 'px');
          occBlock.css('height', (cellHeight * occBlock.attr('data-size') - 3) + 'px');
        });
      })
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

    _addBlockWithTime: function(lecture, isTemp) {
      for (var j=0, classtime; classtime=lecture.classtimes[j]; j++) {
        var dayVal = classtime.day + 2;
        var beginVal = (classtime.begin - 480) / 30;
        var endVal = (classtime.end - 480) / 30;
        var time = endVal - beginVal;

        var dayBlock = $('#timetable-contents').find('.day:nth-child('+ dayVal + ')');
        var blocks = dayBlock.find('.half').slice(beginVal, endVal);

        var occupied = [];
        if (isTemp) {
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
        }
        else {
          blocks.addClass('occupied');
        }

        var lectureBlock = $(this.blockTemplate({title: lecture.title,
                                    id: lecture.id,
                                    professor: lecture.professor_short,
                                    classroom: classtime.classroom_short,
                                    color: lecture.course%16+1,
                                    cells: time,
                                    occupied: occupied,
                                    temp: isTemp,}));
        $(blocks[0]).append(lectureBlock);
        timetableView._sizeBlock(lectureBlock);
      }
    },

    _addBlockWithoutTime: function(lecture, isTemp, idx) {
      var block = $('#timetable-contents')
                    .find('.day:nth-child('+(idx+2)+')')
                    .find('.half.no-time');
      var lectureBlock = $(this.blockTemplate({title: lecture.title,
                                       id: lecture.id,
                                       professor: lecture.professor_short,
                                       classroom: lecture.classroom_short,
                                       color: lecture.course%16+1,
                                       cells: 3,
                                       occupied: [],
                                       temp: isTemp,}));

      block.append(lectureBlock);
      timetableView._sizeBlock(lectureBlock);
    },

    _removeAllBlocks: function() {
      $('#timetable-contents .lecture-block').remove();
      $('#timetable-contents .half').removeClass('occupied');
    },

    _highlight: function(lecture, isClick) {
      if (isClick) {
        $('.lecture-block[data-id=' + lecture.id + ']').addClass('click');
      }
      else {
        $('.lecture-block[data-id=' + lecture.id + ']').addClass('active');
      }
    },

    _unhighlight: function() {
      $('.lecture-block').removeClass('active');
      $('.lecture-block').removeClass('click');
      $('.lecture-block-temp').remove();
    },
  })

  // Actions in lecture list
  app.LectureListView = Backbone.View.extend({
    el: '#lecture-lists',

    loadingMessage: '<div class="list-loading">'+(LANGUAGE_CODE==="en" ? "Loading" : "불러오는 중")+'</div>',
    noResultMessage: '<div class="list-loading">'+(LANGUAGE_CODE==="en" ? "No results" : "결과 없음")+'</div>',

    initialize: function (opt) {
      this.listenTo(app.searchLectureList,
                    'update',
                    this._genListRender(app.searchLectureList, 'search'));
      this.listenTo(app.cartLectureList,
                    'update',
                    this._genListRender(app.cartLectureList, 'cart'));
      this.listenTo(app.majorLectureList,
                    'update',
                    this._genListRender(app.majorLectureList, 'major'));
      this.listenTo(app.humanityLectureList,
                    'update',
                    this._genListRender(app.humanityLectureList, 'humanity'));
    },
      
    events: {
      'click .add-to-table': "addToTable",
      'click .add-to-cart': "addToCart",
      'click .delete-from-cart': "deleteFromCart",

      'mouseover .list-elem-body-wrap': "listHover",
      'mouseout .list-elem-body-wrap': "listOut",
      'click .list-elem-body-wrap': "listClick",
      'click .list-tab': "changeTab",
    },

    addToTable: function (e) {
      if (++loginCount == 3)
        alert(LANGUAGE_CODE==="en" ? "Timetables are not saved for unregistered users. Please sign if you want to save them." : '로그인한 사용자에게만 시간표가 저장됩니다. 저장하려면 로그인해 주세요.');

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
        alert(LANGUAGE_CODE==="en" ? "You can't add lecture overlapping." : '시간표가 겹치는 과목은 추가할 수 없습니다.');
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
      if (++loginCount == 3)
        alert(LANGUAGE_CODE==="en" ? "Timetables are not saved for unregistered users. Please sign if you want to save them." : '로그인한 사용자에게만 시간표가 저장됩니다. 저장하려면 로그인해 주세요.');

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

      if (target.closest(".add-to-table").length
          || target.closest(".add-to-cart").length
          || target.closest(".delete-from-cart").length) {
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

    changeTab: function (e) {
      var tabName = $(e.currentTarget).attr('class').split(' ')[1];

      if ($(e.currentTarget).hasClass('active'))
        return;

      $(this.el).find(".list-tab").removeClass('active');
      $(e.currentTarget).addClass('active');
      $(this.el).find(".list-page").addClass("none");
      if (tabName !== "major")
        $(this.el).find("." + tabName + "-page").removeClass("none");
      else
        $(this.el).find("." + tabName + "-page[data-code='" + $(e.currentTarget).attr('data-code') + "']").removeClass("none");


      if(tabName==="search" && $('.search-page .list-scroll .list-elem').length===0) {
        searchView.showSearch()
      } else {
        searchView.hideSearch()
      }

      if (app.LectureActive.get("from") === "list") {
        app.LectureActive.set({type: "none"});
      }
      $(".nano").nanoScroller();
    },

    _highlight: function(lecture, isClick) {
      if (isClick) {
        $('.list-elem-body-wrap[data-id=' + lecture.id + ']').addClass('click');
      }
      else {
        $('.list-elem-body-wrap[data-id=' + lecture.id + ']').addClass('active');
      }
    },

    _unhighlight: function(e) {
      $('.list-elem-body-wrap').removeClass('active');
      $('.list-elem-body-wrap').removeClass('click');
    },

    _fetchLists: function(year, semester) {
      var options = {data: {year: year,
                            semester: semester},
                     type: 'POST'};

      $(".search-page .list-scroll").html('');
      searchView.showSearch();
      $(".cart-page .list-scroll").html(this.loadingMessage);
      app.cartLectureList.fetch(options);
      $(".major-page .list-scroll").html(this.loadingMessage);
      app.majorLectureList.fetch(options);
      $(".humanity-page .list-scroll").html(this.loadingMessage);
      app.humanityLectureList.fetch(options);
      $(".nano").nanoScroller();
    },
 
    _genListRender: function(lecList, name) {
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
          var majors = $.map($('.list-tab.major'), function(x){return $(x).attr('data-code')});
          for (var i=0,code; code=majors[i]; i++) {
            block = $('.'+name+'-page[data-code="'+code+'"]').find('.nano-content');
            models = _.filter(lecList.models,
                              function(x) {
                                return (x.get('major_code')===code)});

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
    },
  })

  // Actions in lecture detail
  app.LectureDetailView = Backbone.View.extend({
    el: '#lecture-info',
    detailTemplate: _.template($('#lecture-detail-template').html()),
    semesterTemplate: _.template($('#semester-lecture-template').html()),

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

    _fetchDict: function(e) {
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
            result.sort(function(a,b){return b.like-a.like;});
            var template = _.template($('#comment-template').html());
            block.html(template({comments:result}));
          }
          $('.nano').nanoScroller();
        },
      });
    },

    _showLectureInfo: function(lecture,isClick) {
      $(this.el).append(this.detailTemplate(lecture));
      if (isClick) {
        $(".lecture-options #fix-option").removeClass('disable');
        $('.lecture-detail #reviews').html('<div class="review-loading">'+(LANGUAGE_CODE==="en" ? "Loading" : "불러오는 중")+'</div>');
        this._fetchDict();
        this.openDictPreview();
      }
      $(".nano").nanoScroller();
      $(this.el).find(".nano-content").bind("scroll", lectureDetailView.scrollChange);
    },

    _showSemesterInfo: function(title, lectures) {
      $(this.el).append(this.semesterTemplate({title: title,
                                               lectures: lectures,}));
    },

    _clear: function() {
      $(this.el).find('.lecture-detail').remove();
    },
  })

  // Showing lectures info of the semester
  app.SemesterInfoView = Backbone.View.extend({
    el: "#right-side",
    examTemplate: _.template($('#exam-template').html()),

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
      'mouseover .map-location-box': "buildingFocus",
      'mouseout .map-location-box': "clearFocus",
      'mouseover .summary-type-elem': "typeFocus",
      'mouseout .summary-type-elem': "clearFocus",
      'mouseover .summary-credit-elem': "creditFocus",
      'mouseout .summary-credit-elem': "clearFocus",
      'mouseover .exam-day': "examFocus",
      'mouseout .exam-day': "clearFocus",
    },

    initialize: function() {},

    clearFocus: function() {
      if (app.LectureActive.get("type") === "none") {
        lectureDetailView._clear();
        timetableView._unhighlight();
        this._unhighlight();
      }
    },

    _formatLectures: function(lectureIDs, getInfo) {
      var lectures = app.CurrentTimetable.get('lectures');
      var result = [];
      for (var i=0, id; id=lectureIDs[i]; i++) {
        var lecture = findLecture(lectures, id);
        result.push({title: lecture.title,
                     info: getInfo(lecture)});
        timetableView._highlight(lecture, false);
      }
      return result;
    },

    buildingFocus: function(e) {
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

        lectureDetailView._showSemesterInfo(title, lectures);
      }
    },

    typeFocus: function(e) {
      if (app.LectureActive.get("type") === "none") {
        var type = $(e.currentTarget).attr('data-type');
        if (type !== "Etc") {
          var title = (LANGUAGE_CODE==="en" ? type : this.typeDict[type]);
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return x.type_en===type});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return (x.credit? x.credit+(LANGUAGE_CODE==="en" ? " credits" : "학점") : "") + (x.credit_au? x.credit_au+"AU" : "")});

          // Highlight target
          $(e.currentTarget).find('.summary-type-elem-body').addClass('active');
        } else {
          var title = (LANGUAGE_CODE==="en" ? "Others" : "기타");
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return !semesterInfoView.typeDict[x.type_en]});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return (x.credit? x.credit+(LANGUAGE_CODE==="en" ? " credits" : "학점") : "") + (x.credit_au? x.credit_au+"AU" : "")});

          // Highlight target
          $(e.currentTarget).find('.summary-type-elem-body').addClass('active');
        }

        lectureDetailView._showSemesterInfo(title, lectures);
      }
    },

    creditFocus: function(e) {
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

        lectureDetailView._showSemesterInfo(title, lectures);
      }
    },

    examFocus: function(e) {
      if (app.LectureActive.get("type") === "none") {
        var date = $(e.currentTarget).attr('data-date');
        var title = this.dateDict[date] + (LANGUAGE_CODE==="en" ? " Exam" : " 시험");
        var boxes = $(e.currentTarget).find('.exam-elem');
        var lectureIDs = $.map(boxes,
                               function(x){return Number($(x).attr("data-id"))});
        var lectures = this._formatLectures(lectureIDs,
                          function(x){return x.exam.substr(x.exam.indexOf(" ") + 1)});

        // Highlight target
        boxes.addClass("active");

        lectureDetailView._showSemesterInfo(title, lectures);
      }
    },

    _highlight: function(lecture, inTimetable) {
      // Highlight map
      if (inTimetable) {
        var circle = $('#map-container').find(".map-location-circle[data-id="+lecture.id+"]");
        circle.addClass("active");
        circle.closest(".map-location-box").addClass("active");
      } else if (lecture.building) {
        var location = lecture.building.split('-')[0];
        var cont = $('#map-container').find('.map-location.'+location);
        var box = cont.find('.map-location-box');
        cont.removeClass('none');
        box.addClass('active');
        box.append('<span class="map-location-circle color'+(lecture.course%16+1)+' active temp" data-id='+lecture.id+'></span>');
      }

      // Highlight credit
      var typeDiv = $('#summary').find("[data-type='" + lecture.type_en + "']");
      if (typeDiv.length === 0) {
        typeDiv = $('#summary').find("[data-type='Etc']");
      }
      var credit = Number(lecture.credit);
      var au = Number(lecture.credit_au);
      var type_text, credit_text, au_text;
      if (inTimetable) {
        type_text = "(" + (credit+au) + ")";
        credit_text = Number($('#summary').find("#credits .normal").html());
        au_text = Number($('#summary').find("#au .normal").html());
      } else {
        type_text = "+" + (credit + au);
        credit_text = Number($('#summary').find("#credits .normal").html()) + credit;
        au_text = Number($('#summary').find("#au .normal").html()) + au;
      }
      typeDiv.find('.summary-type-elem-additional').html(type_text);
      if (credit !== 0) {
        $('#summary').find("#credits .active").html(String(credit_text));
        $('#summary').find("#credits .normal").addClass("none");
        $('#summary').find("#credits .active").removeClass("none");
      }
      if (au !== 0) {
        $('#summary').find("#au .active").html(String(au_text));
        $('#summary').find("#au .normal").addClass("none");
        $('#summary').find("#au .active").removeClass("none");
      }

      // Highlight exam
      if (inTimetable) {
        $('#examtable').find('.exam-elem[data-id='+lecture.id+']').addClass('active');
      } else {
        for (var j=0, exam; exam=lecture.examtimes[j]; j++) {
          var date = ['mon', 'tue', 'wed', 'thu', 'fri'][exam.day];
          var block = $('#examtable').find('.exam-day[data-date="'+date+'"] .exam-day-body');
          block.append(this.examTemplate({id: lecture.id,
                                          title: lecture.title,
                                          examTime: exam.str.substr(exam.str.indexOf(" ") + 1),
                                          startTime: exam.begin,
                                          temp: true,}));
          $('.nano').nanoScroller();
        }
      }
    },

    _unhighlight: function() {
      // Unhighlight map
      $('#map-container').find('.map-location-circle').removeClass("active");
      $('#map-container').find(".map-location-box").removeClass("active");
      var blocks = $('#map-container').find('.map-location-circle.temp').closest('.map-location');
      $('#map-container').find('.map-location-circle.temp').remove();
      for (var i=0, block; block=blocks[i]; i++)
        if ($(block).children().children().length <= 1)
          $(block).addClass('none');

      // Unhighlight credit
      $('#summary').find('.summary-type-elem-additional').html("");
      $('#summary').find('#credits .normal').removeClass("none");
      $('#summary').find('#credits .active').addClass("none");
      $('#summary').find('#au .normal').removeClass("none");
      $('#summary').find('#au .active').addClass("none");
      $('#summary').find('.summary-type-elem-body').removeClass('active');

      // Unhighlight exam
      $('#examtable').find('.exam-elem').removeClass('active');
      $('#examtable').find('.exam-elem.temp').remove();
      $('#examtable').find('.exam-elem').removeClass('active');
    },

    _removeInfo: function() {
      // Remove map
      $('#map-container').find('.map-location-circle').remove();
      $('#map-container').find('.map-location').addClass('none');

      // Remove credit info
      $('#credits .normal').html('-');
      $('#au .normal').html('-');
      $('.summary-type-elem[data-type="Basic Required"]').find('.summary-type-elem-body').html('-');
      $('.summary-type-elem[data-type="Basic Elective"]').find('.summary-type-elem-body').html('-');
      $('.summary-type-elem[data-type="Major Required"]').find('.summary-type-elem-body').html('-');
      $('.summary-type-elem[data-type="Major Elective"]').find('.summary-type-elem-body').html('-');
      $('.summary-type-elem[data-type="Humanities & Social Elective"]').find('.summary-type-elem-body').html('-');
      $('.summary-type-elem[data-type="Etc"]').find('.summary-type-elem-body').html('-');

      // Remove score
      $('#grades.score-text').html('-');
      $('#loads.score-text').html('-');
      $('#speeches.score-text').html('-');

      // Remove exam info
      $('#examtable').find('.exam-elem').remove();
      for (var i = 0; i<5; i++) {
        var date = ['mon', 'tue', 'wed', 'thu', 'fri'][i];
        var block = $('#examtable').find('.exam-day[data-date="'+date+'"] .exam-day-body');
        block.html('');
      }

      $('#small-buttons #image').attr('href', '/timetable/api/share_image/');
      $('#small-buttons #calendar').attr('href', '/timetable/api/share_calendar/');
    },

    _setShareLink: function(timetable_id) {
      $('#small-buttons #image').attr('href', '/timetable/api/share_image/?table_id='+timetable_id);
      $('#small-buttons #calendar').attr('href', '/timetable/api/share_calendar/?table_id='+timetable_id
                                              +'&year='+app.YearSemester.get('year')
                                              +'&semester='+app.YearSemester.get('semester'));
    },
  })

  // Fetching and changing timetable tabs
  app.TimetableTabView = Backbone.View.extend({
    el: '#timetable-tabs',

    examTemplate: _.template($('#exam-template').html()),

    events: {
      'click .timetable-tab': "changeTab",
      'click .timetable-add': "createTable",
      'click .duplicate-table': "copyTable",
      'click .delete-table': "deleteTable",
    },

    initialize: function() {
      _.bindAll(this,"render");
      this.listenTo(app.CurrentTimetable, 'change', this.render);
      this.listenTo(app.timetables, 'update', this.makeTab);
    },

    _fetchTab: function(year, semester) {
      var options = {data: {year: year,
                            semester: semester},
                    type: 'POST'};
      $('#timetable-tabs').html('<div class="timetable-tab" style="pointer-events:none;"><span class="timetable-num">불러오는 중</span></divs>');
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
        alert(LANGUAGE_CODE==="en" ? "You can't delete the last timetable." : "마지막 시간표는 삭제할 수 없습니다");
        return;
      }
      if (!confirm(LANGUAGE_CODE==="en" ? "Do you really want to delete? The timetable can't be recovered once deleted." : "정말 삭제하시겠습니까?\n삭제된 시간표는 복구할 수 없습니다.")){
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
      timetableView._removeAllBlocks();
      var noTime = 0;
      for (var i = 0, child; child = lectures[i]; i++) {
        if (child.classtimes.length > 0) {
          timetableView._addBlockWithTime(child, false);
        } else {
          timetableView._addBlockWithoutTime(child, false, noTime);
          noTime++;
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
      $('.summary-type-elem[data-type="Basic Required"]').find('.summary-type-elem-body').html(byType[0]);
      $('.summary-type-elem[data-type="Basic Elective"]').find('.summary-type-elem-body').html(byType[1]);
      $('.summary-type-elem[data-type="Major Required"]').find('.summary-type-elem-body').html(byType[2]);
      $('.summary-type-elem[data-type="Major Elective"]').find('.summary-type-elem-body').html(byType[3]);
      $('.summary-type-elem[data-type="Humanities & Social Elective"]').find('.summary-type-elem-body').html(byType[4]);
      $('.summary-type-elem[data-type="Etc"]').find('.summary-type-elem-body').html(byType[5]);

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
        var letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
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
      $('#examtable').find('.exam-elem').remove();
      for (var i = 0, child; child = lectures[i]; i++) {
        for (var j=0, exam; exam=child.examtimes[j]; j++) {
          var date = ['mon', 'tue', 'wed', 'thu', 'fri'][exam.day];
          var block = $('#examtable').find('.exam-day[data-date="'+date+'"] .exam-day-body');
          block.append(this.examTemplate({id: child.id,
                                          title: child.title,
                                          examTime: exam.str.substr(exam.str.indexOf(" ") + 1),
                                          startTime: exam.begin,
                                          temp: false,}));
        }
      }

      // Update active lecture
      app.LectureActive.trigger("change");

      // Update share link
      semesterInfoView._setShareLink(app.CurrentTimetable.get('id'));
    }
  })

  app.SearchView = Backbone.View.extend({
    el: '#lecture-lists',

    loadingMessage: '<div class="list-loading">'+(LANGUAGE_CODE==="en" ? "Loading" : "불러오는 중")+'</div>',

    initialize: function (opt) {
      $(this.el).find(".chkall").prop('checked', true);
    },

    events: {
      'click .search-page-title': "showSearch",
      'click #search-cancel': "hideSearch",
      'click .chkall': "toggleType",
      'click .chkelem': "toggleType",
      'click .search-filter-time-active': "clearTime",
      'click #search-button': "searchStart",
      'keypress': "keyAction",
    },

    clearSearch: function () {
      $(this.el).find(".search-keyword-text").val('');

      $(this.el).find(".chkall").prop('checked', true);
      $(this.el).find(".chkall").parent().find('.fa-check-circle-o').removeClass('none');
      $(this.el).find(".chkall").parent().find('.fa-circle-o').addClass('none');

      $(this.el).find(".chkelem").prop('checked', false);
      $(this.el).find(".chkelem").parent().find('.fa-check-circle-o').addClass('none');
      $(this.el).find(".chkelem").parent().find('.fa-circle-o').removeClass('none');

      this.clearTime();
    },

    clearTime: function() {
      $("#search-filter-time-day").val('');
      $("#search-filter-time-begin").val('');
      $("#search-filter-time-end").val('');
      $(".search-filter-time .search-filter-elem label").html((LANGUAGE_CODE==="en" ? "Drag timetable" : "시간표에서 드래그"));
      $(".search-filter-time .search-filter-elem label").removeClass('search-filter-time-active');
    },

    searchTab: function (e) {
      $(this.el).find(".list-tab").removeClass('active');
      $(this.el).find(".list-tab.search").addClass('active');
      $(this.el).find(".list-page").addClass("none");
      $(this.el).find(".search-page").removeClass("none");

      if (app.LectureActive.get("from") === "list") {
        app.LectureActive.set({type: "none"});
      }
      this.showSearch();
    },

    showSearch: function (e) {
      $(this.el).find(".search-extend").removeClass('none');
      $(this.el).find(".search-keyword-text").focus();
    },

    hideSearch: function (e) {
      this.clearSearch();
      $(this.el).find(".search-extend").addClass('none');
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
      var target = $(".search-form-wrap > form");
      var data = {};
      target.serializeArray().map(function(x){
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

      if (data["keyword"].length == 0 &&
          data["type"].includes("ALL") &&
          data["department"].includes("ALL") &&
          data["grade"].includes("ALL") &&
          data["day"].length == 0) {
        alert(LANGUAGE_CODE==="en" ? "Please select search conditions." : "검색 조건을 선택해 주세요.")
        return;
      }

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
        }
      });
    },

    keyAction: function(e) {
      if (e.keyCode == 13) {
        this.searchStart();
      }
    }
  })

  // Showing informations of target lecture
  app.LectureActiveListenerView = Backbone.View.extend({
    el: '#lecture-info',
    tagName: 'div',

    blockTemplate: _.template($('#timetable-lecture-template').html()),

    initialize: function () {
      this.listenTo(app.LectureActive, 'change', this.changeInfo);
    },

    changeInfo: function () {
      if (app.LectureActive.get("type") === "none") {
        this._deleteInfo();
      } else {
        this._deleteInfo();
        this._render();
      }
    },

    _deleteInfo: function () {
      lectureDetailView._clear();
      lectureListView._unhighlight();
      timetableView._unhighlight();
      semesterInfoView._unhighlight();
    },

    _render: function () {
      var lecture = _.clone(app.LectureActive.get('lecture'));
      var child = lecture;
      var id = Number(lecture.id);
      var inTimetable = findLecture(app.CurrentTimetable.get('lectures'), id);
      var idx = app.CurrentTimetable.get('lectures').length;

      // Show lecture detail
      lectureDetailView._showLectureInfo(lecture, (app.LectureActive.get('type')==='click'));

      // Highlight list
      if (app.LectureActive.get('from') === 'list') {
        lectureListView._highlight(lecture, (app.LectureActive.get('type')==='click'));
      }

      // Highlight timetable blocks
      if (app.LectureActive.get('type')==='click' && app.LectureActive.get('from')==='list') {
        // Do nothing
      }
      else if (inTimetable) {
        // Highlight existing block
        timetableView._highlight(lecture, (app.LectureActive.get('type')==='click'));
      }
      else if (child.classtimes.length > 0) {
        // Make new block and highlight
        timetableView._addBlockWithTime(child, true);
        timetableView._highlight(lecture, (app.LectureActive.get('type')==='click'));
      }
      else {
        // Make new block and highlight
        var noTime = _.filter(app.CurrentTimetable.get('lectures'), function(x){return x.classtimes.length===0}).length;
        timetableView._addBlockWithoutTime(child, true, noTime);
        timetableView._highlight(lecture, (app.LectureActive.get('type')==='click'));
      }

      // Update semester info
      semesterInfoView._highlight(lecture, inTimetable);
    },
  })

  // Changing semester
  app.YearSemesterView = Backbone.View.extend({
    el: '#semester',

    events: {
      'click #semester-prev': 'semesterPrev',
      'click #semester-next': 'semesterNext',
    },

    initialize: function (opt) {
      this.listenTo(app.YearSemester, 'change', this.semesterChange);
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

    semesterChange: function(e) {
      var year = app.YearSemester.get('year');
      var semester = app.YearSemester.get('semester');

      if (year==this.start_year && semester==this.start_semester)
        $(this.el).find("#semester-prev").addClass("disable");
      else
        $(this.el).find("#semester-prev").removeClass("disable");

      if (year==this.end_year && semester==this.end_semester)
        $(this.el).find("#semester-next").addClass("disable");
      else
        $(this.el).find("#semester-next").removeClass("disable");

      lectureListView._fetchLists(app.YearSemester.get('year'),
                                  app.YearSemester.get('semester'));
      timetableTabView._fetchTab(app.YearSemester.get('year'),
                                 app.YearSemester.get('semester'));
      timetableView._removeAllBlocks();
      semesterInfoView._removeInfo();
      app.LectureActive.set({'type': 'none'});
      app.SearchKeyword._abortSave();
    }
  })
})(jQuery);

var timetableView = new app.TimetableView();
var lectureListView = new app.LectureListView();
var lectureDetailView = new app.LectureDetailView();
var semesterInfoView = new app.SemesterInfoView();
var timetableTabView = new app.TimetableTabView();
var searchView = new app.SearchView();
var lectureActiveListenerView = new app.LectureActiveListenerView();
var yearSemesterView = new app.YearSemesterView();

