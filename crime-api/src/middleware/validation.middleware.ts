import { Request, Response, NextFunction } from 'express';

export const validateQueryParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingParams = requiredParams.filter(param => !req.query[param]);
    
    if (missingParams.length > 0) {
      res.status(400).json({
        error: {
          message: `Missing required query parameters: ${missingParams.join(', ')}`,
          status: 400,
          missingParams
        }
      });
      return;
    }
    
    next();
  };
};

export const validateNumericParam = (paramName: string, min?: number, max?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.query[paramName] || req.params[paramName];
    
    if (value !== undefined) {
      const numValue = Number(value);
      
      if (isNaN(numValue)) {
        res.status(400).json({
          error: {
            message: `Parameter '${paramName}' must be a valid number`,
            status: 400,
            parameter: paramName,
            value
          }
        });
        return;
      }
      
      if (min !== undefined && numValue < min) {
        res.status(400).json({
          error: {
            message: `Parameter '${paramName}' must be at least ${min}`,
            status: 400,
            parameter: paramName,
            value: numValue,
            minimum: min
          }
        });
        return;
      }
      
      if (max !== undefined && numValue > max) {
        res.status(400).json({
          error: {
            message: `Parameter '${paramName}' must be at most ${max}`,
            status: 400,
            parameter: paramName,
            value: numValue,
            maximum: max
          }
        });
        return;
      }
    }
    
    next();
  };
};
