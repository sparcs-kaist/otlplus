import React, { Component } from 'react';


class ReviewWriteBlock extends Component {
    render() {
        return (
            <form className="block block--review-write">
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
                        <label className="block--review-write__score__option"><input type="radio" name="grade" value="A"/><span>A</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="grade" value="B"/><span>B</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="grade" value="C"/><span>C</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="grade" value="D"/><span>D</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="grade" value="F"/><span>F</span></label>
                    </div>
                    <div className="block--review-write__score">
                        <span className="block--review-write__score__name">널널</span>
                        <label className="block--review-write__score__option"><input type="radio" name="load" value="A"/><span>A</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="load" value="B"/><span>B</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="load" value="C"/><span>C</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="load" value="D"/><span>D</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="load" value="F"/><span>F</span></label>
                    </div>
                    <div className="block--review-write__score">
                        <span className="block--review-write__score__name">강의</span>
                        <label className="block--review-write__score__option"><input type="radio" name="speech" value="A"/><span>A</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="speech" value="B"/><span>B</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="speech" value="C"/><span>C</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="speech" value="D"/><span>D</span></label>
                        <label className="block--review-write__score__option"><input type="radio" name="speech" value="F"/><span>F</span></label>
                    </div>
                </div>
                <div className="block--review-write__buttons">
                    <button className="text-button text-button--review-write-block" type="reset">
                        업로드
                    </button>
                </div>
            </form>
        );
    }
}


export default ReviewWriteBlock;
