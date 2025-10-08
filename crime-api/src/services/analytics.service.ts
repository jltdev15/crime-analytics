import { Crime, Barangay } from '../models';

export interface SummaryStats {
  totalCrimes: number;
  averageCrimesPerBarangay: number;
  highestCrimeCount: { barangay: string; count: number };
  lowestCrimeCount: { barangay: string; count: number };
  highestCrimeRate: { barangay: string; rate: number };
  lowestCrimeRate: { barangay: string; rate: number };
  dateRange: {
    earliest: string | null;
    latest: string | null;
    duration: string | null;
  };
}

export interface BarangayCounts {
  totalBarangays: number;
  withPopulation: number;
  withCrimes: number;
}

export interface CrimeTypeDistribution {
  type: string;
  count: number;
}

export interface BarangayCrimeStats {
  barangay: string;
  crimeCount?: number;
  population?: number;
  crimeRate?: number;
}

export class AnalyticsService {
  /**
   * Get summary statistics for all crimes
   */
  async getSummaryStats(): Promise<SummaryStats> {
    const [totalCrimes, dateRange] = await Promise.all([
      Crime.aggregate([{ $count: 'total' }]),
      Crime.aggregate([
        {
          $group: {
            _id: null,
            earliest: { $min: '$confinementDate' },
            latest: { $max: '$confinementDate' }
          }
        }
      ])
    ]);

    const grouped = await Crime.aggregate([
      {
        $group: {
          _id: { barangay: '$barangay', municipality: '$municipality', province: '$province', country: '$country' },
          crimeCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'barangays',
          let: { b: '$_id.barangay', m: '$_id.municipality', p: '$_id.province', c: '$_id.country' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: [{ $toUpper: '$name' }, { $toUpper: '$$b' }] },
              { $eq: [{ $toUpper: '$municipality' }, { $toUpper: '$$m' }] },
              { $eq: [{ $toUpper: '$province' }, { $toUpper: '$$p' }] },
              { $eq: [{ $toUpper: '$country' }, { $toUpper: '$$c' }] }
            ] } } },
            { $project: { population: 1 } }
          ],
          as: 'barangayDoc'
        }
      },
      { $unwind: { path: '$barangayDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          barangay: '$_id.barangay',
          crimeCount: 1,
          population: '$barangayDoc.population',
          crimeRate: {
            $cond: [{ $and: [{ $ne: ['$barangayDoc.population', null] }, { $gt: ['$barangayDoc.population', 0] }] },
              { $multiply: [{ $divide: ['$crimeCount', '$barangayDoc.population'] }, 1000] },
              null]
          }
        }
      }
    ]);

    const counts = grouped.map(g => g.crimeCount);
    const avg = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
    const highestCrime = grouped.reduce((acc, cur) => cur.crimeCount > (acc?.crimeCount ?? -1) ? cur : acc, null as any);
    const lowestCrime = grouped.reduce((acc, cur) => cur.crimeCount < (acc?.crimeCount ?? Number.MAX_SAFE_INTEGER) ? cur : acc, null as any);
    const withRate = grouped.filter(g => typeof g.crimeRate === 'number');
    const highestRate = withRate.reduce((acc, cur) => (cur.crimeRate ?? -1) > (acc?.crimeRate ?? -1) ? cur : acc, null as any);
    const lowestRate = withRate.reduce((acc, cur) => (cur.crimeRate ?? Number.MAX_SAFE_INTEGER) < (acc?.crimeRate ?? Number.MAX_SAFE_INTEGER) ? cur : acc, null as any);

    // Calculate date range and duration
    const earliest = dateRange[0]?.earliest ?? null;
    const latest = dateRange[0]?.latest ?? null;
    let duration: string | null = null;
    
    if (earliest && latest) {
      const earliestYear = new Date(earliest).getFullYear();
      const latestYear = new Date(latest).getFullYear();
      const yearDiff = latestYear - earliestYear;
      
      if (yearDiff === 0) {
        duration = `${earliestYear}`;
      } else {
        duration = `${earliestYear} - ${latestYear}`;
      }
    }

    return {
      totalCrimes: totalCrimes[0]?.total ?? 0,
      averageCrimesPerBarangay: Number(avg.toFixed(2)),
      highestCrimeCount: highestCrime ? { barangay: highestCrime.barangay, count: highestCrime.crimeCount } : { barangay: '', count: 0 },
      lowestCrimeCount: lowestCrime ? { barangay: lowestCrime.barangay, count: lowestCrime.crimeCount } : { barangay: '', count: 0 },
      highestCrimeRate: highestRate ? { barangay: highestRate.barangay, rate: Number(highestRate.crimeRate.toFixed(2)) } : { barangay: '', rate: 0 },
      lowestCrimeRate: lowestRate ? { barangay: lowestRate.barangay, rate: Number(lowestRate.crimeRate.toFixed(2)) } : { barangay: '', rate: 0 },
      dateRange: {
        earliest: earliest ? new Date(earliest).toISOString().split('T')[0] ?? null : null,
        latest: latest ? new Date(latest).toISOString().split('T')[0] ?? null : null,
        duration
      }
    };
  }

  /**
   * Get top barangays by crime count
   */
  async getTopBarangaysByCrimeCount(limit: number = 5): Promise<BarangayCrimeStats[]> {
    const top = await Crime.aggregate([
      { $group: { _id: { barangay: '$barangay', municipality: '$municipality', province: '$province', country: '$country' }, crimeCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'barangays',
          let: { b: '$_id.barangay', m: '$_id.municipality', p: '$_id.province', c: '$_id.country' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: [{ $toUpper: '$name' }, { $toUpper: '$$b' }] },
              { $eq: [{ $toUpper: '$municipality' }, { $toUpper: '$$m' }] },
              { $eq: [{ $toUpper: '$province' }, { $toUpper: '$$p' }] },
              { $eq: [{ $toUpper: '$country' }, { $toUpper: '$$c' }] }
            ] } } },
            { $project: { population: 1 } }
          ],
          as: 'barangayDoc'
        }
      },
      { $unwind: { path: '$barangayDoc', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, barangay: '$_id.barangay', crimeCount: 1, population: '$barangayDoc.population' } },
      { $sort: { crimeCount: -1 } },
      { $limit: limit }
    ]);
    return top;
  }

  /**
   * Get top barangays by crime rate
   */
  async getTopBarangaysByCrimeRate(limit: number = 5): Promise<BarangayCrimeStats[]> {
    const top = await Crime.aggregate([
      { $group: { _id: { barangay: '$barangay', municipality: '$municipality', province: '$province', country: '$country' }, crimeCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'barangays',
          let: { b: '$_id.barangay', m: '$_id.municipality', p: '$_id.province', c: '$_id.country' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: [{ $toUpper: '$name' }, { $toUpper: '$$b' }] },
              { $eq: [{ $toUpper: '$municipality' }, { $toUpper: '$$m' }] },
              { $eq: [{ $toUpper: '$province' }, { $toUpper: '$$p' }] },
              { $eq: [{ $toUpper: '$country' }, { $toUpper: '$$c' }] }
            ] } } },
            { $project: { population: 1 } }
          ],
          as: 'barangayDoc'
        }
      },
      { $unwind: { path: '$barangayDoc', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, barangay: '$_id.barangay', crimeRate: { $cond: [{ $and: [{ $ne: ['$barangayDoc.population', null] }, { $gt: ['$barangayDoc.population', 0] }] }, { $multiply: [{ $divide: ['$crimeCount', '$barangayDoc.population'] }, 1000] }, null] } } },
      { $match: { crimeRate: { $ne: null } } },
      { $sort: { crimeRate: -1 } },
      { $limit: limit }
    ]);
    return top.map(t => ({ barangay: t.barangay, crimeRate: Number(t.crimeRate.toFixed(2)) }));
  }

  /**
   * Get crime distribution by barangay
   */
  async getCrimeDistribution(): Promise<BarangayCrimeStats[]> {
    const dist = await Crime.aggregate([
      { $group: { _id: { barangay: '$barangay', municipality: '$municipality', province: '$province', country: '$country' }, count: { $sum: 1 } } },
      { $project: { _id: 0, barangay: '$_id.barangay', crimeCount: '$count' } },
      { $sort: { crimeCount: -1 } }
    ]);
    return dist;
  }

  /**
   * Get crime type distribution
   */
  async getCrimeTypeDistribution(filters?: {
    barangay?: string;
    municipality?: string;
    province?: string;
  }): Promise<CrimeTypeDistribution[]> {
    const match: any = {};
    if (filters?.barangay) match.barangay = filters.barangay.toUpperCase();
    if (filters?.municipality) match.municipality = filters.municipality.toUpperCase();
    if (filters?.province) match.province = filters.province.toUpperCase();

    const pipeline: any[] = [];
    if (Object.keys(match).length) pipeline.push({ $match: match });
    pipeline.push(
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    );

    return await Crime.aggregate(pipeline);
  }

  /**
   * Get barangay counts
   */
  async getBarangayCounts(): Promise<BarangayCounts> {
    const [totalBarangays, withPopulation] = await Promise.all([
      Barangay.countDocuments({}),
      Barangay.countDocuments({ population: { $gt: 0 } })
    ]);
    const distinctFromCrimes = await Crime.aggregate([
      { $group: { _id: { b: '$barangay', m: '$municipality', p: '$province', c: '$country' } } },
      { $count: 'count' }
    ]);
    return {
      totalBarangays,
      withPopulation,
      withCrimes: distinctFromCrimes[0]?.count ?? 0
    };
  }

  /**
   * Get barangays with low crime rate
   */
  async getLowCrimeRateBarangays(threshold: number = 1): Promise<BarangayCrimeStats[]> {
    const results = await Crime.aggregate([
      { $group: { _id: { barangay: '$barangay', municipality: '$municipality', province: '$province', country: '$country' }, crimeCount: { $sum: 1 } } },
      { $lookup: { from: 'barangays', let: { b: '$_id.barangay', m: '$_id.municipality', p: '$_id.province', c: '$_id.country' }, pipeline: [
        { $match: { $expr: { $and: [
          { $eq: [{ $toUpper: '$name' }, { $toUpper: '$$b' }] },
          { $eq: [{ $toUpper: '$municipality' }, { $toUpper: '$$m' }] },
          { $eq: [{ $toUpper: '$province' }, { $toUpper: '$$p' }] },
          { $eq: [{ $toUpper: '$country' }, { $toUpper: '$$c' }] }
        ] } } },
        { $project: { population: 1 } }
      ], as: 'barangayDoc' } },
      { $unwind: { path: '$barangayDoc', preserveNullAndEmptyArrays: false } },
      { $project: { _id: 0, barangay: '$_id.barangay', population: '$barangayDoc.population', crimeRate: { $cond: [{ $and: [{ $ne: ['$barangayDoc.population', null] }, { $gt: ['$barangayDoc.population', 0] }] }, { $multiply: [{ $divide: ['$crimeCount', '$barangayDoc.population'] }, 1000] }, null] } } },
      { $match: { crimeRate: { $ne: null, $lte: threshold } } },
      { $sort: { crimeRate: 1 } }
    ]);
    return results.map(r => ({ barangay: r.barangay, crimeRate: Number(r.crimeRate.toFixed(2)) }));
  }
}
