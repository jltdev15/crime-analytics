import { Request, Response } from 'express';
import { Barangay } from '../models';
import { asyncHandler, CustomError } from '../middleware/error.middleware';

export class BarangayController {
  /**
   * Get all barangays with optional filtering and pagination
   */
  getBarangays = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.municipality) filter.municipality = { $regex: req.query.municipality, $options: 'i' };
    if (req.query.province) filter.province = { $regex: req.query.province, $options: 'i' };
    if (req.query.country) filter.country = { $regex: req.query.country, $options: 'i' };

    const [barangays, total] = await Promise.all([
      Barangay.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Barangay.countDocuments(filter)
    ]);

    res.json({
      barangays,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  /**
   * Get barangay by ID
   */
  getBarangayById = asyncHandler(async (req: Request, res: Response) => {
    const barangay = await Barangay.findById(req.params.id);
    
    if (!barangay) {
      throw new CustomError('Barangay not found', 404);
    }

    res.json(barangay);
  });

  /**
   * Create new barangay
   */
  createBarangay = asyncHandler(async (req: Request, res: Response) => {
    const barangay = new Barangay(req.body);
    await barangay.save();
    
    res.status(201).json(barangay);
  });

  /**
   * Update barangay
   */
  updateBarangay = asyncHandler(async (req: Request, res: Response) => {
    const barangay = await Barangay.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!barangay) {
      throw new CustomError('Barangay not found', 404);
    }

    res.json(barangay);
  });

  /**
   * Delete barangay
   */
  deleteBarangay = asyncHandler(async (req: Request, res: Response) => {
    const barangay = await Barangay.findByIdAndDelete(req.params.id);

    if (!barangay) {
      throw new CustomError('Barangay not found', 404);
    }

    res.status(204).send();
  });

  /**
   * Get barangays by municipality
   */
  getBarangaysByMunicipality = asyncHandler(async (req: Request, res: Response) => {
    const { municipality } = req.params;
    
    const barangays = await Barangay.find({ 
      municipality: { $regex: municipality, $options: 'i' } 
    }).sort({ name: 1 });

    res.json(barangays);
  });

  /**
   * Get barangays by province
   */
  getBarangaysByProvince = asyncHandler(async (req: Request, res: Response) => {
    const { province } = req.params;
    
    const barangays = await Barangay.find({ 
      province: { $regex: province, $options: 'i' } 
    }).sort({ municipality: 1, name: 1 });

    res.json(barangays);
  });

  /**
   * Search barangays
   */
  searchBarangays = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    
    if (!q) {
      throw new CustomError('Search query is required', 400);
    }

    const barangays = await Barangay.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { municipality: { $regex: q, $options: 'i' } },
        { province: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    res.json(barangays);
  });
}
