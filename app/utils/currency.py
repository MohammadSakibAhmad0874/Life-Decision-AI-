"""
Currency utilities — USD to INR conversion + Indian number formatting.
"""

USD_TO_INR = 83  # fixed conversion rate

def usd_to_inr(usd_value: float) -> int:
    """Convert a USD salary to INR."""
    return int(round(usd_value * USD_TO_INR, -2))  # round to nearest 100


def format_inr(inr_value: float) -> str:
    """
    Format a number in Indian Rupee notation (lakhs/crores).
    Examples:
        500000  → ₹5,00,000
        1250000 → ₹12,50,000
        95000   → ₹95,000
    """
    value = int(round(inr_value))
    if value < 0:
        return f"-{format_inr(-value)}"
    if value < 1000:
        return f"₹{value}"
    if value < 100000:
        # below 1 lakh — standard 3-digit grouping
        s = str(value)
        # last 3 digits
        last3 = s[-3:]
        rest   = s[:-3]
        result = f"₹{rest},{last3}" if rest else f"₹{last3}"
        return result
    # 1 lakh and above — Indian grouping (first group 3, then 2s)
    s = str(value)
    last3 = s[-3:]
    rem   = s[:-3]
    parts = []
    while len(rem) > 2:
        parts.append(rem[-2:])
        rem = rem[:-2]
    if rem:
        parts.append(rem)
    parts.reverse()
    formatted = ",".join(parts) + "," + last3
    return f"₹{formatted}"


def salary_inr_display(usd_value: float) -> str:
    """Convert USD salary to formatted INR string."""
    return format_inr(usd_to_inr(usd_value))
