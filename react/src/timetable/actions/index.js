export const OPEN_SEARCH = "OPEN_SEARCH";
export const CLOSE_SEARCH = "CLOSE_SEARCH";
export const FETCH_SEARCH = "FETCH_SEARCH";
export const ADD_LECTURE_TO_TIMETABLE = "ADD_LECTURE_TO_TIMETABLE";
export const UPDATE_CELL_SIZE = "UPDATE_CELL_SIZE";
export const SET_LECTURE_ACTIVE = "SET_LECTURE_ACTIVE";
export const CLEAR_LECTURE_ACTIVE = "CLEAR_LECTURE_ACTIVE";
export const SET_MULTIPLE_DETAIL = "SET_MULTIPLE_DETAIL";
export const CLEAR_MULTIPLE_DETAIL = "CLEAR_MULTIPLE_DETAIL";

export function openSearch() {
    console.log("Action openSearch");
    return {
        type : OPEN_SEARCH,
    }
}

export function closeSearch() {
    console.log("Action closeSearch");
    return {
        type : CLOSE_SEARCH,
    }
}

export function fetchSearch(courses) {
    console.log("Action fetchSearch");
    return {
        type : FETCH_SEARCH,
        courses : courses,
    }
}

export function addLectureToTimetable(lecture) {
    console.log("Action addLectureToTimetable");
    return {
        type : ADD_LECTURE_TO_TIMETABLE,
        lecture : lecture,
    }
}

export function updateCellSize(width, height) {
    console.log("Action updateCellSize");
    return {
        type : UPDATE_CELL_SIZE,
        width : width,
        height : height,
    }

}

export function setLectureActive(lecture, from, clicked) {
    console.log("Action setLectureActive");
    return {
        type : SET_LECTURE_ACTIVE,
        lecture : lecture,
        from : from,
        clicked : clicked,
    }
}

export function clearLectureActive() {
    console.log("Action clearLectureActive");
    return {
        type : CLEAR_LECTURE_ACTIVE,
    }
}

export function setMultipleDetail(title, lectures) {
    console.log("Action setMultipleDetail");
    return {
        type : SET_MULTIPLE_DETAIL,
        title : title,
        lectures : lectures,
    }
}

export function clearMultipleDetail() {
    console.log("Action clearMultipleDetail");
    return {
        type : CLEAR_MULTIPLE_DETAIL,
    }
}