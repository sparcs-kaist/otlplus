#!/bin/bash
echo "Start!"
echo $(date +'%Y-%m-%d / %T') > db_update_script.log

python manage.py makemigrations >> db_update_script.log
python manage.py makemigrations review >> db_update_script.log
python manage.py makemigrations session >> db_update_script.log
python manage.py makemigrations timetable >> db_update_script.log
python manage.py makemigrations subject >> db_update_script.log
python manage.py check >> db_update_script.log
python manage.py migrate >> db_update_script.log
python update_scholardb.py >> db_update_script.log
python manage.py update_ProfessorCourseList >> db_update_script.log
python manage.py update_CourseCodenum >> db_update_script.log
python manage.py update_CourseFiltered >> db_update_script.log
python manage.py update_LectureTitle >> db_update_script.log
#python update_taken_lecture.py >> db_update_script.log

echo "Done!"
