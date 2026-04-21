def compute_streak_for_day(previous_streak: int, completed_daily_goal: bool) -> int:
    if not completed_daily_goal:
        return 0
    return previous_streak + 1
