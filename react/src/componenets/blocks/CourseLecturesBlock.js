import React from 'react';

const CourseLecturesBlock = (props) => {
  const getClass = (lecture) => {
    switch (lecture.class_title.length) {
      case 1:
        return 'class-title fixed-1';
      case 2:
        return 'class-title fixed-2';
      default:
        return 'class-title';
    }
  };
  const change = props.isClicked || props.isHover ? 'click' : '';
  return (
      <div className={`list-elem-body-wrap ${change}`} onClick={() => props.listClick(props.lecture)()} onMouseOver={() => props.listHover(props.lecture)()} onMouseOut={() => props.listOut()}>
        <div className="list-elem-body">
          <div className="list-elem-body-text">
            <strong className={getClass(props.lecture)}>{props.lecture.class_title}</strong>
            &nbsp;
            <span className="class-prof">{props.lecture.professor_short}</span>
          </div>
          {
            props.fromCart
              ? <div className="delete-from-cart" onClick={event => props.deleteFromCart(props.lecture)(event)}><i /></div>
              : (
                !props.inCart
                  ? <div className="add-to-cart" onClick={event => props.addToCart(props.lecture)(event)}><i /></div>
                  : <div className="add-to-cart disable"><i /></div>
              )
          }
          {
            !props.inTimetable
              ? <div className="add-to-table" onClick={event => props.addToTable(props.lecture)(event)}><i /></div>
              : <div className="add-to-table disable"><i /></div>
          }
        </div>
      </div>
  );
};

export default CourseLecturesBlock;
