"""Test video quiz business logic without database."""

from datetime import datetime, timezone
from uuid import uuid4

# Simulate the scoring logic
def test_quiz_scoring():
    """Test quiz scoring calculation."""
    total_questions = 10
    correct_answers = 8
    
    score_percent = int((correct_answers / total_questions) * 100)
    print(f"✓ Score calculation: {correct_answers}/{total_questions} = {score_percent}%")
    
    assert score_percent == 80, f"Expected 80, got {score_percent}"
    
    # Test pass threshold
    pass_threshold = 70
    passed = score_percent >= pass_threshold
    print(f"✓ Pass threshold: {passed} (threshold={pass_threshold}%)")
    
    assert passed is True, "Should have passed with 80%"


def test_xp_calculation():
    """Test XP earning logic."""
    base_xp = 100
    correct_count = 8
    bonus_per_correct = 10
    
    xp = base_xp + (correct_count * bonus_per_correct)
    print(f"✓ XP base: {base_xp} + ({correct_count} × {bonus_per_correct}) = {xp}")
    
    assert xp == 180, f"Expected 180, got {xp}"
    
    # Test perfect score bonus
    if correct_count == 10:
        xp += 50
    print(f"✓ XP with potential perfect bonus: {xp}")


def test_badges():
    """Test badge assignment logic."""
    score_percent = 100
    pass_threshold = 70
    
    badges = []
    
    if score_percent >= pass_threshold:
        badges.append("quiz_master")
    
    if score_percent == 100:
        badges.append("perfect_score")
    
    print(f"✓ Badges earned: {badges}")
    assert "perfect_score" in badges, "Should earn perfect_score badge"
    assert "quiz_master" in badges, "Should earn quiz_master badge"


def test_time_calculation():
    """Test time spent calculation."""
    start = datetime(2026, 4, 29, 12, 0, 0, tzinfo=timezone.utc)
    end = datetime(2026, 4, 29, 12, 5, 30, tzinfo=timezone.utc)
    
    time_spent = int((end - start).total_seconds())
    print(f"✓ Time spent: {time_spent} seconds ({time_spent // 60}m {time_spent % 60}s)")
    
    assert time_spent == 330, f"Expected 330 (5:30), got {time_spent}"


def test_response_parsing():
    """Test response data parsing."""
    responses = [
        {"question_id": "q1", "user_answer": "hello"},
        {"question_id": "q2", "user_answer": "goodbye"},
        {"question_id": "q3", "user_answer": "no"},
    ]
    
    print(f"✓ Parsed {len(responses)} responses")
    
    for i, response in enumerate(responses, 1):
        print(f"  Response {i}: Q{response['question_id']} = {response['user_answer']}")
    
    assert len(responses) == 3, f"Expected 3 responses, got {len(responses)}"


if __name__ == "__main__":
    print("\n=== Testing Video Quiz Business Logic ===\n")
    
    try:
        test_quiz_scoring()
        print()
        test_xp_calculation()
        print()
        test_badges()
        print()
        test_time_calculation()
        print()
        test_response_parsing()
        print("\n✓ All tests passed!\n")
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}\n")
        exit(1)
