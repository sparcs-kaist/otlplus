#!/bin/bash
echo "Start!"
echo $(date +'%Y-%m-%d / %T') >db_update_script.log 2>&1
BASEDIR=$(dirname $(readlink -f "$0"))
python $BASEDIR/manage.py makemigrations >>db_update_script.log 2>&1
python $BASEDIR/manage.py makemigrations review >>db_update_script.log 2>&1
python $BASEDIR/manage.py makemigrations session >>db_update_script.log 2>&1
python $BASEDIR/manage.py makemigrations timetable >>db_update_script.log 2>&1
python $BASEDIR/manage.py makemigrations subject >>db_update_script.log 2>&1
python $BASEDIR/manage.py check >>db_update_script.log 2>&1
python $BASEDIR/manage.py migrate >>db_update_script.log 2>&1
python $BASEDIR/update_scholardb.py >>db_update_script.log 2>&1
python $BASEDIR/manage.py update_ProfessorCourseList >>db_update_script.log 2>&1
python $BASEDIR/manage.py update_CourseFiltered >>db_update_script.log 2>&1
python $BASEDIR/update_taken_lecture.py >>db_update_script.log 2>&1

echo "Done!"
