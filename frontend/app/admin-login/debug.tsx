// Debug script - Add this temporarily to admin-login/page.tsx to check localStorage

export function debugLogin() {
  if (typeof window === "undefined") return;

  // Check what's in localStorage
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  console.log("=== AFTER LOGIN DEBUG ===");
  console.log("Token stored:", !!token ? "✅ YES" : "❌ NO");
  console.log("User stored:", !!userStr ? "✅ YES" : "❌ NO");
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log("User object:", user);
      console.log("is_admin value:", user.is_admin);
      console.log("is_admin type:", typeof user.is_admin);
      console.log("is_admin === true?", user.is_admin === true);
      console.log("is_admin === 'true'?", user.is_admin === "true");
    } catch (e) {
      console.error("Failed to parse user:", e);
    }
  }
}
