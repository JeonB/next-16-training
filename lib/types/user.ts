/**
 * 사용자 관련 타입 정의
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role?: "admin" | "user" | "guest";
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: "admin" | "user" | "guest";
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
