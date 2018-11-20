import React, { Component } from 'react';


class CourseBlock extends Component {
    render() {
        return (
            <div className="block block--course">
                <div className="block--course__title">
                    <strong>문제해결기법</strong>
                    &nbsp;
                    <span>CS202</span>
                </div>
                <div className="block--course__info">
                    <div className="block--course__info__name">
                        분류
                    </div>
                    <div>
                        전산학부, 전공선택
                    </div>
                </div>
                <div className="block--course__info">
                    <div className="block--course__info__name">
                        교수
                    </div>
                    <div>
                        류석영, 신성용, 좌경룡
                    </div>
                </div>
                <div className="block--course__info">
                    <div className="block--course__info__name">
                        설명
                    </div>
                    <div>
                        이 과목은 문제해결 및 알고리즘의 개발 방법을 소개하고 프로그래밍 기법을 다룬다. 이를 위해 배열, 스텍,큐 등의 기본적인 데이터구조 개념과 순환, 탐색 및 정렬 알고리즘 등을 다룬다. 좋은 프로그램의 구성을 위한 계획, 코딩, 디버깅, 그리고 문서화하는 법을 다양한 프로그래밍 실습을 통하여 습득한다.
                    </div>
                </div>
            </div>
        );
    }
}


export default CourseBlock;
