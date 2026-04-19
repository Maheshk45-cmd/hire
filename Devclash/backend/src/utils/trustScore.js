export const calculateTrustScore = (user) => {
  let score = 0;
  const breakdown = {};

  if (user.legalName) {
    score += 20;
    breakdown.legalName = 20;
  }
  if (user.isFaceVerified) {
    score += 20;
    breakdown.isFaceVerified = 20;
  }
  if (user.role === "OWNER") {
    score += 30;
    breakdown.role = 30;
  }
  if (user.role === "ADMIN") {
    score += 20;
    breakdown.role = 20;
  }
  if (user.isTrustedPoster) {
    score += 30;
    breakdown.isTrustedPoster = 30;
  }

  // Ensure max score is theoretically 100 
  // (though OWNER + Trusted = 60 + 40 = 100)
  score = Math.min(score, 100);

  let level = "LOW";
  if (score >= 31 && score <= 70) {
    level = "MEDIUM";
  } else if (score >= 71) {
    level = "HIGH";
  }

  return { score, level, breakdown };
};
