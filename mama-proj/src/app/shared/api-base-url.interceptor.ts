import { HttpInterceptorFn } from '@angular/common/http';
import { getApiBaseUrl } from './api-config';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/')) {
    return next(req);
  }

  return next(req.clone({ url: `${getApiBaseUrl()}${req.url}` }));
};
