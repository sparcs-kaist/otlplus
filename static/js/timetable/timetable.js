var timetableView = Backbone.View.extend({
  initialize: function (opt) {
    this.isLookingTable = false;
  },
  el: '#timetable-contents',
  events: {
    'click .half': "clickHandler"
  },
  clickHandler: function (e) {
    if (this.isLookingTable) {
      this.isLookingTable = false;
      this.secondBlock = {
        day: $(e.target).data('day'),
        time: $(e.target).data('time')
      }
      this.searchLecture();
      // this.cleanHalfs();

    } else {
      this.cleanHalfs();

      $(e.target).addClass('clicked');
      this.isLookingTable = true;
      this.firstBlock = {
        day: $(e.target).data('day'),
        time: $(e.target).data('time')
      };
    }
  },

  cleanHalfs: function () {
    console.log($(this).find('.half'));
    $(this.el).find('.half').removeClass('clicked').removeClass('selected');
  },

  searchLecture: function () {
    var fBDay = this.indexOfDay(this.firstBlock.day) + 1;
    var sBDay = this.indexOfDay(this.secondBlock.day) + 1;
    var fBTime = this.indexOfTime(this.firstBlock.time) + 1 ;
    var sBTime = this.indexOfTime(this.secondBlock.time) + 1 ;

    console.log(fBDay, sBDay, fBTime, sBTime);

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

    console.log(fBDay, sBDay, fBTime, sBTime);

    console.log(
      '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')',
      $(this.el)
      .find(
      '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')')
    )


    $(this.el)
      .find(
      '.day:nth-child(n+' + fBDay + '):nth-child(-n+' + sBDay + ')')
      .find('.half:nth-child(n+' + fBTime + '):nth-child(-n+' + sBTime + ')')
      .addClass('selected');

    console.log(lectureList);
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
  }
})

var lecturelistView = Backbone.View.extend({
  el: '.lecture-list',
  initialize: function (opt) {
    // this.isLookingTable = false;
  },

  events: {
    'click .close': "closeView"
  },

  closeView: function () {
    this.$el.addClass('closed');
  }
})

var timetable = new timetableView();
var lectureList = new lecturelistView();

$("#timetable-contents > div > div").click(function() {
  $.ajax({
    type: 'GET',
    url: '/timetable/lecture/',
    data: {code: "300"},
    success: function(data) {
      $('#course-title').text(data.title);
      $('#course-no').text(data.old_code + '(' + data.class_no + ')');
      $('#department').text(data.department.join(', '));
      $('#course-type').text(data.course_type);
      $('#instructor').text(data.professor.join(', '));
      $('#classroom').text(data.classroom);
      $('#class-size').text(data.limit);
      $('#exam-time').text(data.examtime);
      $('#language').text(data.language);
      $('#credit').text(data.credit);
      $('#rate').text(data.rate);
    }});
});
