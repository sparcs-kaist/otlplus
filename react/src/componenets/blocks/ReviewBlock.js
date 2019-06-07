import React, { Component } from 'react';


class ReviewBlock extends Component {
  render() {
    return (
      <div className="block block--review">
        <div className="block--review__title">
          <strong>데이타구조</strong>
          <span>류덕산</span>
          <span>2018 봄</span>
        </div>
        <div className="block--review__content">
          데이타구조 과목 중 비전산과 학생들을 위한 과목이자 유일한 한국어 과목입니다. 언어로는 파이썬을 사용해 프밍기만 들은 학생들에게도 쉽게 느껴질 것 같습니다.
          로드는 숙제와 퀴즈가 있는데, 전혀 부담없었습니다. 다만, 한국어강의임에도 불구하고 교수님의 강의력이 그닥 좋지 않다는 생각이 많이 들었습니다.
          다른 전산과 과목인 이산구조와 마찬가지로, 성적 평균이 매우 높기 때문에 실수하지 않도록 해야 하고, 숙제는 절대로 놓쳐서는 안되는 것 같습니다.

          비전산과 학생임에도 불구하고 전산에 관심이 많아 전산과를 부전공 또는 복수전공을 하고 싶은 학생이라면 차라리 다른 교수님 강의를 듣는 것을 추천합니다. 강의 내용이 다른 강의에 비해 일부 빠져있더군요.
          하지만 단순히 학점채우기용으로는 로드도 없고 난이도도 쉬운 과목이었던 것 같습니다.
        </div>
        <div className="block--review__menus">
          <span className="block--review__menus__score">
            추천 <strong>0</strong>
          </span>
          <span className="block--review__menus__score">
            성적 <strong>B</strong>
          </span>
          <span className="block--review__menus__score">
            널널 <strong>A</strong>
          </span>
          <span className="block--review__menus__score">
            강의 <strong>C</strong>
          </span>
          <button className="text-button text-button--review-block">
            좋아요
          </button>
          <button className="text-button text-button--black text-button--review-block">
            신고하기
          </button>
        </div>
      </div>
    );
  }
}


export default ReviewBlock;
