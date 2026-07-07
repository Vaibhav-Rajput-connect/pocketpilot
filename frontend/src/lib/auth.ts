// Since we are using HttpOnly cookies, we cannot read the tokens directly from JavaScript.
// Authentication state is managed strictly by the presence of a valid `user` object in the AuthProvider
// and the success/failure of API requests.

export function clearTokens(): void {
  // Cookies are cleared by the backend /auth/logout endpoint.
  // This is just a placeholder if any client-side cleanup is needed later.
}
