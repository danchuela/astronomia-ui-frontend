const EMAIL_KEY = "astronomia_demo_email";

export function useAuth() {
  const email = localStorage.getItem(EMAIL_KEY);
  return { email, isAuthenticated: !!email };
}

export function setEmail(value: string) {
  localStorage.setItem(EMAIL_KEY, value.trim());
}

export function clearEmail() {
  localStorage.removeItem(EMAIL_KEY);
}
