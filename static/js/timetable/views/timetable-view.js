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
    return _.find(lectures, (x)=>(x.get('id')===id));
  } else {
    return _.find(lectures, (x)=>(x.id===id));
  }
}


(function ($) {
  'use strict';

  // Timetable View
  // ---------------

  // Dragging timetable
  app.TimetableClickSearchView = Backbone.View.extend({
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
      'click .drag-close': "dragClose",
    },

    dragStart: function (e) {
      if (this.isBubbling) {
        this.isBubbling = false;
      } else {
        e.stopPropagation();
        e.preventDefault();
        this.isDragging = true;
        $(this.dragCell).removeClass('none');
        $(this.dragCell).children().addClass('none');

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
          $(this.dragCell).children().removeClass('none');
        }
      }
    },

    clickBlock: function () {
      if (!this.isDragging) {
        this.isBubbling = true;
      }
    },

    dragClose: function (e) {
      $(this.dragCell).addClass('none');
    },
    
    searchLecture: function () {
      var fBDay = this.indexOfDay(this.firstBlock.day) + 2;
      var sBDay = this.indexOfDay(this.secondBlock.day) + 2;
      var fBTime = this.indexOfTime(this.firstBlock.time) + 2;
      var sBTime = this.indexOfTime(this.secondBlock.time) + 2;
      var temp;
      if (fBDay > sBDay) {
        temp = fBDay;
        fBDay = sBDay;
        sBDay = temp;
      }
      
      if (fBTime > sBTime) {
        temp = fBTime;
        fBTime = sBTime;
        sBTime = temp;
      }
      
      var days = $(this.el)
        .find(
        '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')');
      for (var i = 0, day; day = days[i]; i++) {
        for (var j = fBTime; j < sBTime + 1; j++) {
          $(day).find('.half:nth-child(' + j + ')').addClass('selected');
        }
      }
      
      lectureList.$el.removeClass('closed');
    },

    indexOfDay: function (day) {
      var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      return days.indexOf(day);
    },
    
    indexOfTime: function (time) {
      var time = parseInt(time);
      var firstTime = 800;
      time -= firstTime;
      
      var hour = Math.round(time / 100);
      var min = time - hour * 100;

      return hour*2 + min/30;
    },

    render: function () {
      if(timetable.firstBlock) {
        var left = Math.min(timetable.firstBlock.offset().left, timetable.secondBlock.offset().left) - $(timetable.el).offset().left - 1;
        var width = Math.abs(timetable.firstBlock.offset().left - timetable.secondBlock.offset().left) + timetable.firstBlock.width() + 2;
        var top = Math.min(timetable.firstBlock.offset().top, timetable.secondBlock.offset().top) - $(timetable.el).offset().top + 2;
        var height = Math.abs(timetable.firstBlock.offset().top - timetable.secondBlock.offset().top) + timetable.firstBlock.height() -2;

        $(timetable.dragCell).css('left', left+'px');
        $(timetable.dragCell).css('width', width+'px');
        $(timetable.dragCell).css('top', top+'px');
        $(timetable.dragCell).css('height', height+'px');
      }
    }
  })

  // Adding lectures to timetable and cart from lecture lists
  app.lectureListView = Backbone.View.extend({
    el: '#result-pages',
    initialize: function (opt) {
    },
      
    events: {
      'click .add-to-table': "addToTable",
    },

    addToTable: function (e) {
      var ct = $(e.currentTarget);
      var lecture_id = Number(ct.closest('.list-elem-body-wrap').attr('data-id'));
      var timetable_id = Number(app.CurrentTimetable.get('id'));

      // If class time overlaps : TODO
      if (false) {
        return;
      }
      // If lecture is already in timetable
      if (findLecture(app.CurrentTimetable.get('lectures'), lecture_id)) {
        console.log(123);
        return;
      }

      $.ajax({
        url: "/timetable/api/update",
        type: "POST",
        data: {
          table_id: timetable_id,
          lecture_id: lecture_id,
          delete: false,
        },
        success: function(result) {
          var lecList;
          switch (ct.parent().parent().parent().parent().parent().attr('class').split()[0]) {
            case 'search-page':
              lecList = app.searchLectureList;
              break;
            case 'major-page':
              lecList = app.majorLectureList;
              break;
            case 'humanity-page':
              lecList = app.humanityLectureList;
              break;
          }
          var lecture = _.find(lecList.models, function(x){return x.get("id")===lecture_id});

          // Update app.CurrentTimetable
          // app.timetables is automaticall updated because it has same array pointers
          app.CurrentTimetable.get('lectures').push(lecture.attributes);
          app.CurrentTimetable.trigger('change');
        },
      });
    },
  })

  // Targetting lecture in timetable blocks
  app.TimetableLectureBlocksView = Backbone.View.extend({
    el: '#timetable-contents',
    //el: '#center',
    tagName: 'div',

    events: {
      'mouseover .lecture-block': "blockHover",
      'mouseout .lecture-block': "blockOut",
      'click': "blockClick",
      'click .lecture-delete': "deleteLecture",
    },
    
    initialize: function() {},

    blockHover: function (e) {
      if (app.LectureActive.get("type") !== "click") {
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
      if (app.LectureActive.get("type") !== "click") {
        app.LectureActive.set({type: "none"});
      }
    },

    blockClick: function (e) {
      var target = $(e.target);
      var block = target.closest('.lecture-block');

      if (block.length === 0) {
        // Click target is not child(or itself) of lecture block
        app.LectureActive.set({type: "none"});
      } else if (app.LectureActive.get('type') === 'click'
                 && app.LectureActive.get('from') === 'table'
                 && app.LectureActive.get('lecture').id === id) {
        app.LectureActive.set({type: "none"});
      } else {
        var id = Number(block.attr('data-id'));
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
        url: "/timetable/api/update",
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

  // Targetting lecture in from lecture lists
  app.ListLectureBlocksView = Backbone.View.extend({
    el: '#result-pages',

    events: {
      'mouseover .list-elem-body-wrap': "listHover",
      'mouseout .list-elem-body-wrap': "listOut",
      'click .list-elem-body-wrap': "listClick",
    },
    
    initialize: function() {
    },

    listHover: function (e) {
      if (app.LectureActive.get("type") !== "click") {
        var ct = $(e.currentTarget);
        var id = Number(ct.attr('data-id'));
        var lecList;
        switch (ct.parent().parent().parent().attr('class').split()[0]) {
          case 'search-page':
            lecList = app.searchLectureList;
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
      var ct = $(e.currentTarget);
      var id = Number(ct.attr('data-id'));

      if (app.LectureActive.get('type') === 'click'
          && app.LectureActive.get('from') === 'list'
          && app.LectureActive.get('lecture').id === id) {
        app.LectureActive.set({type: "none"});
      } else {
        var lecList;
        switch (ct.parent().parent().parent().attr('class').split()[0]) {
          case 'search-page':
            lecList = app.searchLectureList;
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

  // Showing lectures info of the semester
  app.SemesterLectureView = Backbone.View.extend({
    el: "#right-side",
    block: "#lecture-info",
    semesterTemplate: _.template($('#semester-lecture-template').html()),
    lectureTemplate: _.template($('#lecture-detail-template').html()),

    typeDict: {"Basic Required": "기초필수",
               "Basic Elective": "기초선택",
               "Major Required": "전공필수",
               "Major Elective": "전공선택",
               "Humanities & Social Elective": "인문사회선택",},
    dateDict: {"mon": "월요일",
               "tue": "화요일",
               "wed": "수요일",
               "thu": "목요일",
               "fri": "금요일",
               "sat": "토요일",
               "sun": "일요일",},

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
      if ($(e.target).hasClass('map-location-circle')) {
        return;
      }
      if (app.LectureActive.get("type") === "none") {
        var buildingNo = $(e.currentTarget).closest(".map-location").attr("data-building");
        var title = buildingNo;
        var circles = $(e.currentTarget).find(".map-location-circle");
        var lectureIDs = $.map(circles,
                               function(x){return Number($(x).attr("data-id"))});
        var lectures = this._formatLectures(lectureIDs,
                          function(x){return '101호'});

        // Highlight target
        $(e.currentTarget).addClass('active');
        $(e.currentTarget).find('.map-location-circle').addClass('active');

        $(this.block).html(this.semesterTemplate({title: title,
                                                  lectures: lectures,}));
      }
    },

    typeInfo: function(e) {
      if (app.LectureActive.get("type") === "none") {
        var type = $(e.currentTarget).attr('data-type');
        if (type !== "Etc") {
          var title = this.typeDict[type];
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return x.type_en===type});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return (x.credit? x.credit+"학점" : "") + (x.credit_au? x.credit_au+"AU" : "")});

          // Highlight target
          $(e.currentTarget).find('.credit-text').addClass('active');
        } else {
          var title = "기타";
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return !semesterLectureView.typeDict[x.type_en]});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return (x.credit? x.credit+"학점" : "") + (x.credit_au? x.credit_au+"AU" : "")});

          // Highlight target
          $(e.currentTarget).find('.credit-text').addClass('active');
        }
        $(this.block).html(this.semesterTemplate({title: title,
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
          var title = "학점";
          var raw_lectures = _.filter(app.CurrentTimetable.get('lectures'), function(x){return x.credit>0});
          var lectureIDs = raw_lectures.map(function(x){return x.id});
          var lectures = this._formatLectures(lectureIDs,
                            function(x){return x.credit+"학점"});

          // Highlight target
          $('#credits .active').html($('#credits .normal').html());
          $('#credits .normal').addClass('none');
          $('#credits .active').removeClass('none');
        }
        $(this.block).html(this.semesterTemplate({title: title,
                                                  lectures: lectures,}));
      }
    },

    examInfo: function(e) {
      if (app.LectureActive.get("type") === "none") {
        var date = $(e.currentTarget).attr('data-date');
        var title = this.dateDict[date] + " 시험";
        var boxes = $(e.currentTarget).find('.exam-box');
        var lectureIDs = $.map(boxes,
                               function(x){return Number($(x).attr("data-id"))});
        var lectures = this._formatLectures(lectureIDs,
                          function(x){return x.format_exam});

        // Highlight target
        boxes.addClass("active");

        $(this.block).html(this.semesterTemplate({title: title,
                                                  lectures: lectures,}));
      }
    },
  })

  // Showing informations of target lecture
  app.LectureActiveView = Backbone.View.extend({
    el: '#lecture-info',
    tagName: 'div',

    detailTemplate: _.template($('#lecture-detail-template').html()),
    blockTemplate: _.template($('#timetable-lecture-template').html()),
    examTemplate: _.template($('#exam-template').html()),

    initialize: function () {
      this.listenTo(app.LectureActive, 'change', this.changeInfo);
    },

    events: {
      'click .open-dict-button': "openDictPreview",
      'click .close-dict-button': "closeDictPreview",
      'click #fix-option': "unfix",
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
      $('#lecture-info').html(this.detailTemplate(lecture));
      if (app.LectureActive.get('type') === 'click') {
        $(".lecture-options #fix-option").removeClass('disable');
      }

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
        for (var j=0; j<2; j++) { // TODO : Change this with real classtime
          child['day'] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][idx%2 + 2*j];
          if (Math.floor(idx/2)%2 == 0) {
            child['starttime'] = (Math.floor(idx / 4) * 3 + 9) + '00';
            child['endtime'] = (Math.floor(idx / 4) * 3 + 10) + '30';
          } else {
            child['starttime'] = (Math.floor(idx / 4) * 3 + 10) + '30';
            child['endtime'] = (Math.floor(idx / 4) * 3 + 12) + '00';
          }

          var day = timetable.indexOfDay(child.day) + 2;
          var startTime = timetable.indexOfTime(child.starttime) + 2;
          var endTime = timetable.indexOfTime(child.endtime) + 2;
          var time = endTime-startTime;
          var block = $('#timetable-contents')
            .find(
            '.day:nth-child(n+' + day + '):nth-child(-n+' + day + ')')
            .find('.half:nth-child(n+' + startTime + '):nth-child(-n+' + startTime + ')')
          block.html(this.blockTemplate({title: child.title,
                                    id: child.id,
                                    professor: child.format_professor_str,
                                    classroom: child.format_classroom_short,
                                    color: child.course%16+1, // TODO : get real color
                                    cells: time,
                                    temp: true,}));
        }
        timetableTabView.resize();
      }

      // Update map
      if (inTimetable) {
        var circle = $('#map-container').find(".map-location-circle[data-id="+id+"]");
        circle.addClass("active");
        circle.closest(".map-location-box").addClass("active");
      } else {
        for (var j=0; j<1; j++) { // TODO : Change this with real classtime
          var location = ['E11', 'N4', 'N1', 'N25'][idx%4];
          var cont = $('#map-container').find('.map-location.'+location);
          var box = cont.find('.map-location-box');
          cont.removeClass('none');
          box.addClass('active');
          box.append('<span class="map-location-circle color'+(child.course%16+1)+' active temp" data-id='+child.id+'></span>');
        }
      }

      // Update exam info
      if (inTimetable) {
        $('#examtable').find('.exam-box[data-id='+id+']').addClass('active');
      } else {
        for (var j=0; j<1; j++) { // TODO : Change this with real examtime
          var date = ['mon', 'tue', 'wed', 'thu', 'fri'][idx%5];
          var block = $('#examtable').find('.examtime[data-date="'+date+'"] .examlist');
          var startTime = Math.floor(idx/5) * 3 + 6;
          var endTime = Math.floor(idx/5) * 3 + 9;
          var examTime = startTime + ':00 ~ ' + endTime + ':00';
          block.append(this.examTemplate({id: child.id,
                                          title: child.title,
                                          examTime: examTime,
                                          startTime: startTime,
                                          temp: true,}));
        }
      }
    },

    openDictPreview: function(e) {
      $(this.el).find('.detail-top').addClass('none');
      $(this.el).find('.detail-bottom').removeClass('none');
    },

    closeDictPreview: function(e) {
      $(this.el).find('.detail-bottom').addClass('none');
      $(this.el).find('.detail-top').removeClass('none');
    },

    unfix: function(e) {
      app.LectureActive.set({type: "none"});
    }
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
        url: "/timetable/api/table_delete",
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
        url: "/timetable/api/table_create",
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
          var newTable = _.find(app.timetables, function(x){return x.get('id')===result.id});
          app.CurrentTimetable.set(newTable.attributes);
        },
      });
    },

    copyTable: function(e) {
      var block = $(e.currentTarget).closest('.timetable-tab');
      var id = Number(block.attr('data-id'));

      $.ajax({
        url: "/timetable/api/table_copy",
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
          var newTable = _.find(app.timetables, function(x){return x.get('id')===result.id});
          app.CurrentTimetable.set(newTable.attributes);
        },
      });
    },

    resize: function() {
      var blocks = $('.lecture-block');
      for (var i=0, block; block=blocks[i]; i++) {
        block = $(block);
        var cell = $(block.closest('.half'));
        var w = cell.width();
        var h = cell.height()+1;
        var time = block.attr('data-cells');
        block.css({width: w+2,
                   height: h*time-3});
      }
    },

    render: function() {
      var lectures = app.CurrentTimetable.get('lectures')

      // Highlight selected timetable tab
      var id = app.CurrentTimetable.get('id');
      $('.timetable-tab').removeClass('active');
      $('.timetable-tab[data-id='+id+']').addClass('active');

      // Make timetable blocks
      $('#timetable-contents .lecture-block').remove();
      for (var i = 0, child; child = lectures[i]; i++) {
        for (var j=0; j<2; j++) { // TODO : Change this with real classtime
          child['day'] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i%2 + 2*j];
          if (Math.floor(i/2)%2 == 0) {
            child['starttime'] = (Math.floor(i / 4) * 3 + 9) + '00';
            child['endtime'] = (Math.floor(i / 4) * 3 + 10) + '30';
          } else {
            child['starttime'] = (Math.floor(i / 4) * 3 + 10) + '30';
            child['endtime'] = (Math.floor(i / 4) * 3 + 12) + '00';
          }

          var day = timetable.indexOfDay(child.day) + 2;
          var startTime = timetable.indexOfTime(child.starttime) + 2;
          var endTime = timetable.indexOfTime(child.endtime) + 2;
          var time = endTime-startTime;
          var block = $('#timetable-contents')
            .find(
            '.day:nth-child(n+' + day + '):nth-child(-n+' + day + ')')
            .find('.half:nth-child(n+' + startTime + '):nth-child(-n+' + startTime + ')')
          block.html(this.template({title: child.title,
                                    id: child.id,
                                    professor: child.format_professor_str,
                                    classroom: child.format_classroom_short,
                                    color: child.course%16+1, // TODO : get real color
                                    cells: time,
                                    temp: false,}));
        }
      }
      this.resize();

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

      // Delete lectureactive if not in new timetable
      var activeID = app.LectureActive.get('id')
      if (!findLecture(lectures, activeID)) {
        app.LectureActive.set({'type': 'none'});
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
        for (var j=0; j<1; j++) { // TODO : Change this with real classtime
          var location = ['E11', 'N4', 'N1', 'N25'][i%4];
          var block = $('#map-container').find('.map-location.'+location);
          block.removeClass('none');
          block.find('.map-location-box').append('<span class="map-location-circle color'+(child.course%16+1)+'" data-id='+child.id+'></span>');
        }
      }

      // Update exam info
      $('#examtable').find('.exam-box').remove();
      for (var i = 0, child; child = lectures[i]; i++) {
        for (var j=0; j<1; j++) { // TODO : Change this with real examtime
          var date = ['mon', 'tue', 'wed', 'thu', 'fri'][i%5];
          var block = $('#examtable').find('.examtime[data-date="'+date+'"] .examlist');
          var startTime = Math.floor(i/5) * 3 + 6;
          var endTime = Math.floor(i/5) * 3 + 9;
          var examTime = startTime + ':00 ~ ' + endTime + ':00';
          console.log(examTime);
          block.append(this.examTemplate({id: child.id,
                                          title: child.title,
                                          examTime: examTime,
                                          startTime: startTime,
                                          temp: false,}));
        }
      }

      // Update active lecture
      app.LectureActive.trigger("change");
    }
  })
})(jQuery);

var timetable = new app.TimetableClickSearchView();
var lectureList = new app.lectureListView();
var userLectureList = new app.TimetableLectureBlocksView();
var userLectureList2 = new app.ListLectureBlocksView();
var semesterLectureView = new app.SemesterLectureView();
var lectureActiveView = new app.LectureActiveView();
var timetableTabView = new app.TimetableTabView();
