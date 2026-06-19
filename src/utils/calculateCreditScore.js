export function calculateCreditScore(user) {
  let score = 500;

  if ((user.wallet?.balance || 0) > 50000)
    score += 120;
  else if ((user.wallet?.balance || 0) > 10000)
    score += 70;
  else
    score += 20;

  if (user.kyc?.pan)
    score += 80;

  if (user.kyc?.aadhaar)
    score += 80;

  if (user.status === "active")
    score += 100;

  if (user.status === "blocked")
    score -= 150;

  if (user.status === "suspended")
    score -= 80;

  if (score > 900)
    score = 900;

  return score;
}