from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Iterable, Sequence


@dataclass(frozen=True)
class AnswerCheckResult:
    is_correct: bool
    normalized_user_answer: str
    matched_answer: str | None
    similarity_score: float | None


_ZERO_WIDTH_CHARS = (
    "\u200b",  # ZERO WIDTH SPACE
    "\u200c",  # ZERO WIDTH NON-JOINER
    "\u200d",  # ZERO WIDTH JOINER
    "\ufeff",  # ZERO WIDTH NO-BREAK SPACE / BOM
)

# Keep letters/digits/underscore + whitespace, remove the rest.
_PUNCT_RE = re.compile(r"[^\w\s]", flags=re.UNICODE)


def normalize_answer(text: str) -> str:
    """Normalize user/expected answers for robust matching.

    Rules:
    - Unicode normalize (NFC) to reduce Khmer combining-form inconsistencies
    - Trim + collapse whitespace
    - Case-insensitive for Latin (casefold)
    - Remove punctuation while preserving Khmer letters and Latin word characters
    """

    if text is None:
        return ""

    value = unicodedata.normalize("NFC", text)
    for ch in _ZERO_WIDTH_CHARS:
        value = value.replace(ch, "")

    value = value.strip()
    value = re.sub(r"[-_]+", " ", value)
    value = _PUNCT_RE.sub("", value)
    value = " ".join(value.split())
    value = value.casefold()
    return value


def _similarity(a: str, b: str) -> float:
    """Return similarity score in [0.0, 1.0]."""

    if not a or not b:
        return 0.0

    # Optional fast path if rapidfuzz is installed.
    try:
        from rapidfuzz import fuzz  # type: ignore

        return float(fuzz.ratio(a, b)) / 100.0
    except Exception:
        return SequenceMatcher(None, a, b).ratio()


def check_answer(
    user_answer: str,
    *,
    correct_answer: str,
    acceptable_answers: Sequence[str] | None = None,
    enable_similarity: bool = False,
    similarity_threshold: float = 0.8,
) -> AnswerCheckResult:
    """Check a user answer against canonical + acceptable answers.

    Matching strategy:
    1) Exact match after normalization.
    2) If enabled: similarity match with best score >= threshold.

    Notes:
    - Khmer vs English equivalence is handled by including both in acceptable_answers.
    - Similarity matching is best for small typos in the same script.
    """

    normalized_user = normalize_answer(user_answer or "")

    candidates: list[str] = []
    if correct_answer:
        candidates.append(correct_answer)
    if acceptable_answers:
        candidates.extend([a for a in acceptable_answers if a])

    # Map normalized -> original (first occurrence wins)
    normalized_to_original: dict[str, str] = {}
    for candidate in candidates:
        normalized = normalize_answer(candidate)
        if normalized and normalized not in normalized_to_original:
            normalized_to_original[normalized] = candidate

    if not normalized_user:
        return AnswerCheckResult(
            is_correct=False,
            normalized_user_answer=normalized_user,
            matched_answer=None,
            similarity_score=None,
        )

    if normalized_user in normalized_to_original:
        return AnswerCheckResult(
            is_correct=True,
            normalized_user_answer=normalized_user,
            matched_answer=normalized_to_original[normalized_user],
            similarity_score=1.0,
        )

    if not enable_similarity:
        return AnswerCheckResult(
            is_correct=False,
            normalized_user_answer=normalized_user,
            matched_answer=None,
            similarity_score=None,
        )

    # Avoid surprising matches for very short inputs.
    if len(normalized_user) < 3:
        return AnswerCheckResult(
            is_correct=False,
            normalized_user_answer=normalized_user,
            matched_answer=None,
            similarity_score=None,
        )

    best_score = 0.0
    best_normalized: str | None = None
    for normalized_candidate in normalized_to_original.keys():
        score = _similarity(normalized_user, normalized_candidate)
        if score > best_score:
            best_score = score
            best_normalized = normalized_candidate

    matched = normalized_to_original.get(best_normalized) if best_normalized else None
    return AnswerCheckResult(
        is_correct=best_score >= similarity_threshold,
        normalized_user_answer=normalized_user,
        matched_answer=matched,
        similarity_score=best_score,
    )
