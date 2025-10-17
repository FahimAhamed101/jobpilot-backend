// In shared/sendResponse.ts
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface IApiResponse<T> {
  code: number;
  success: boolean;
  message?: string | null;
  data?: T | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

const sendResponse = <T>(
  res: Response,
  data: {
    code: number;
    success: boolean;
    message?: string;
    data?: T;
    meta?: {
      page: number;
      limit: number;
      total: number;
    };
  }
): void => {
  const responseData: IApiResponse<T> = {
    code: data.code,
    success: data.success,
    message: data.message || null,
    data: data.data || null,
  };

  if (data.meta) {
    responseData.meta = data.meta;
  }

  // Make sure we're using the correct status code
  res.status(data.code).json(responseData);
};

export default sendResponse;