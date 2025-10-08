import { Request, Response } from 'express';
import { Crime } from '../models';
import { asyncHandler, CustomError } from '../middleware/error.middleware';

export class CrimeController {
  /**
   * Get all crimes with optional filtering and pagination
   */
  getCrimes = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (req.query.type) filter.type = { $regex: req.query.type, $options: 'i' };
    if (req.query.barangay) filter.barangay = { $regex: req.query.barangay, $options: 'i' };
    if (req.query.municipality) filter.municipality = { $regex: req.query.municipality, $options: 'i' };
    if (req.query.province) filter.province = { $regex: req.query.province, $options: 'i' };
    if (req.query.status) filter.status = { $regex: req.query.status, $options: 'i' };

    const [crimes, total] = await Promise.all([
      Crime.find(filter)
        .sort({ confinementDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Crime.countDocuments(filter)
    ]);

    res.json({
      crimes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  /**
   * Get crime by ID
   */
  getCrimeById = asyncHandler(async (req: Request, res: Response) => {
    const crime = await Crime.findById(req.params.id);
    
    if (!crime) {
      throw new CustomError('Crime not found', 404);
    }

    res.json(crime);
  });

  /**
   * Create new crime record
   */
  createCrime = asyncHandler(async (req: Request, res: Response) => {
    const crime = new Crime(req.body);
    await crime.save();
    
    res.status(201).json(crime);
  });

  /**
   * Update crime record
   */
  updateCrime = asyncHandler(async (req: Request, res: Response) => {
    const crime = await Crime.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!crime) {
      throw new CustomError('Crime not found', 404);
    }

    res.json(crime);
  });

  /**
   * Delete crime record
   */
  deleteCrime = asyncHandler(async (req: Request, res: Response) => {
    const crime = await Crime.findByIdAndDelete(req.params.id);

    if (!crime) {
      throw new CustomError('Crime not found', 404);
    }

    res.status(204).send();
  });

  /**
   * Get crime statistics by date range
   */
  getCrimeStatsByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new CustomError('startDate and endDate are required', 400);
    }

    const filter: any = {
      confinementDate: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    };

    const stats = await Crime.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCrimes: { $sum: 1 },
          avgAge: { $avg: '$age' },
          crimesByType: { $push: '$type' },
          crimesByStatus: { $push: '$status' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCrimes: 1,
          avgAge: { $round: ['$avgAge', 2] },
          typeDistribution: {
            $reduce: {
              input: '$crimesByType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  { $arrayToObject: [[{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]] }
                ]
              }
            }
          },
          statusDistribution: {
            $reduce: {
              input: '$crimesByStatus',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  { $arrayToObject: [[{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]] }
                ]
              }
            }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalCrimes: 0,
      avgAge: 0,
      typeDistribution: {},
      statusDistribution: {}
    });
  });
}
