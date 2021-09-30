from typing import List, Optional

from apps.subject.models import Semester

def get_target_semesters(use_default_semester: bool, year: int, semester: int,
                         expand_semester_by: int) -> Optional[List[Semester]]:

    if year is not None and semester is not None:
        target_semester = (year, semester)
    elif use_default_semester:
        default_semester = Semester.get_semester_to_default_import()
        if default_semester is not None:
            target_semester = (default_semester.year, default_semester.semester)
        else:
            print("Failed to load default semester.")
            return
    else:
        print("Target semester not specified. Use --year and --semester, or --use-default-semester")
        return

    if expand_semester_by is None:
        offsets = [0]
    elif expand_semester_by > 0:
        offsets = range(0, expand_semester_by + 1)
    else:
        offsets = range(expand_semester_by, 1)

    return [
        Semester.get_offsetted_semester(target_semester[0], target_semester[1], o)
        for o in offsets
    ]
