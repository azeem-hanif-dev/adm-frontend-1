import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const BASE_URL = "https://adm-backend-theta.vercel.app/api/";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T = unknown> {
  data: T | null;
  status: boolean;
}

export const API_HANDLER = async <T = unknown>(
  method: HttpMethod,
  endpoint: string,
  data?: unknown,
  params?: Record<string, any>
): Promise<ApiResponse<T>> => {
  const isFormData = data instanceof FormData;

  const config: AxiosRequestConfig = {
    method,
    url: `${BASE_URL}${endpoint}`,
    data,
    params,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      //   ...(localStorage.getItem("token") && {
      // Authorization: `Bearer ${localStorage.getItem("token")}`,
      //   }),
    },
  };

  try {
    const response: AxiosResponse<T> = await axios(config);
    return {
      data: response.data,
      status: true,
    };
  } catch (error: any) {
    return {
      data: error?.response?.data ?? null,
      status: false,
    };
  }
};
