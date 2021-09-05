#!/bin/bash
echo "Start!"
echo $(date +'%Y-%m-%d / %T') >db_update_script.log 2>&1
BASEDIR=$(dirname $(readlink -f "$0"))
python $BASEDIR/scripts/do_import_scholardb.py >>db_update_script.log 2>&1
python $BASEDIR/manage.py update_ProfessorCourseList >>db_update_script.log 2>&1
python $BASEDIR/scripts/do_import_taken_lecture.py >>db_update_script.log 2>&1
python $BASEDIR/scripts/do_import_user_major_all.py >>db_update_script.log 2>&1
python $BASEDIR/manage.py update-best-reviews >>db_update_script.log 2>&1

echo "Done!"
