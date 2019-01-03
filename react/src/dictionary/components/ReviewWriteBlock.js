import React, { Component } from 'react';


class ReviewWriteBlock extends Component {
    render() {
        return (
            <div className="block block--review-write">
                <div className="block--review-write__title">
                    <strong>데이타구조</strong>
                    <span>이기혁</span>
                    <span>2016 봄</span>
                </div>
                <textarea className="block--review-write__content" placeholder="학점, 로드 등의 평가에 대하여 왜 그렇게 평가를 했는지 서술해주세요.">
                </textarea>
                <div>
                    <div className="block--review-write__score">
                        <span className="block--review-write__score__name">성적</span>
                        <span className="block--review-write__score__option">A</span>
                        <span className="block--review-write__score__option">B</span>
                        <span className="block--review-write__score__option">C</span>
                        <span className="block--review-write__score__option">D</span>
                        <span className="block--review-write__score__option">F</span>
                    </div>
                    <div className="block--review-write__score">
                        <span className="block--review-write__score__name">널널</span>
                        <span className="block--review-write__score__option">A</span>
                        <span className="block--review-write__score__option">B</span>
                        <span className="block--review-write__score__option">C</span>
                        <span className="block--review-write__score__option">D</span>
                        <span className="block--review-write__score__option">F</span>
                    </div>
                    <div className="block--review-write__score">
                        <span className="block--review-write__score__name">강의</span>
                        <span className="block--review-write__score__option">A</span>
                        <span className="block--review-write__score__option">B</span>
                        <span className="block--review-write__score__option">C</span>
                        <span className="block--review-write__score__option">D</span>
                        <span className="block--review-write__score__option">F</span>
                    </div>
                </div>
                <div className="text-button text-button--review-write-block">
                    업로드
                </div>
            </div>
        );
    }
}


export default ReviewWriteBlock;
