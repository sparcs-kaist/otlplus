import csv
import random
from os import path


def anonymize_professor_m2m(filename: str, mapping: dict):
    rows = []

    with open(path.join(path.dirname(__file__), "data", filename), "r") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        for row in reader:
            row[0] = mapping[row[0]]
            rows.append(row)
    with open(path.join(path.dirname(__file__), "data", filename), "w") as file:
        writer = csv.writer(file, delimiter=',')
        writer.writerows([header, *rows])


def execute():
    rows = []
    professor_pk = []
    professor_pk_map = dict()

    with open(path.join(path.dirname(__file__), "data/subject_professor.csv"), "r") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        for row in reader:
            professor_pk.append(row[0])
            rows.append(row)

    random.shuffle(professor_pk)
    for index, pk in enumerate(professor_pk):
        professor_pk_map[pk] = index

    for i in range(len(rows)):
        rows[i][0] = professor_pk_map[rows[i][0]]
        rows[i][1] = f"교수_{rows[i][0]}"
        rows[i][2] = f"Professor_{rows[i][0]}"

    with open(path.join(path.dirname(__file__), "data/subject_professor.csv"), "w") as file:
        writer = csv.writer(file, delimiter=',')
        writer.writerows([header, *rows])

    anonymize_professor_m2m("subject_professor_course_list.csv", professor_pk_map)
    anonymize_professor_m2m("subject_lecture_professors.csv", professor_pk_map)
    anonymize_professor_m2m("subject_course_professors.csv", professor_pk_map)


if __name__ == "__main__":
    execute()
