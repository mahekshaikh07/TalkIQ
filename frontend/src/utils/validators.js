export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, percent: 0, label: "", barClass: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Weak", barClass: "bg-rose-500" },
    { label: "Fair", barClass: "bg-rose-400" },
    { label: "Good", barClass: "bg-amber-400" },
    { label: "Strong", barClass: "bg-emerald-500" },
  ];

  const level = levels[Math.max(score - 1, 0)];
  return { score, percent: (score / 4) * 100, ...level };
}