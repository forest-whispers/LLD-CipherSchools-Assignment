export interface AuthUser {
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface CurrentUserResponse {
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.message || "An unexpected error occurred";
    throw new Error(errorMsg);
  }
  return data as T;
}

export const authApi = {
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return parseResponse<CurrentUserResponse>(res);
  },

  async login(credentials: LoginInput): Promise<LoginResponse> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return parseResponse<LoginResponse>(res);
  },

  async logout(): Promise<LogoutResponse> {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return parseResponse<LogoutResponse>(res);
  },
};
