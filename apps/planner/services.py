from django.db.models import F, Case, When

from .models import Planner


def reorder_planner(planner: Planner, target_arrange_order: int):
    related_planners = Planner.get_related_planners(planner.user,
                                                    planner.entrance_year, planner.track)
    original_arrange_order = planner.arrange_order

    if target_arrange_order < original_arrange_order:
        related_planners.filter(arrange_order__gte=target_arrange_order,
                                arrange_order__lte=original_arrange_order) \
                        .update(arrange_order=Case(When(arrange_order=original_arrange_order,
                                                        then=target_arrange_order),
                                                        default=F("arrange_order")+1))
    elif target_arrange_order > original_arrange_order:
        related_planners.filter(arrange_order__gte=original_arrange_order,
                                arrange_order__lte=target_arrange_order) \
                        .update(arrange_order=Case(When(arrange_order=original_arrange_order,
                                                        then=target_arrange_order),
                                                        default=F("arrange_order")-1))