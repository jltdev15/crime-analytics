/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const mongoose = require('mongoose');

// Load TS-compiled models via dist if available, else use TS via ts-node register not needed for runtime script.
// We'll define light-weight schemas here matching the user's requested structures to avoid build coupling.

const CrimeSchema = new mongoose.Schema({
  caseId: { type: String, required: false, trim: true },
  type: { type: String, required: true, trim: true },
  caseNumber: { type: String, required: false, trim: true },
  status: { type: String, required: true },
  gender: { type: String, required: false },
  age: { type: Number, required: false },
  civilStatus: { type: String, required: false },
  confinementDate: { type: Date, required: true },
  confinementTime: { type: String, required: true },
  barangay: { type: String, required: true, index: true },
  municipality: { type: String, required: true, index: true },
  province: { type: String, required: true, index: true },
  country: { type: String, required: true }
}, { timestamps: true });

const BarangaySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  municipality: { type: String, required: true, trim: true },
  province: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  population: { type: Number, required: false }
}, { timestamps: true });
BarangaySchema.index({ name: 1, municipality: 1, province: 1, country: 1 }, { unique: true });

const PredictionSchema = new mongoose.Schema({
  barangay: { type: String, required: true },
  municipality: { type: String, required: true },
  province: { type: String, required: true },
  crimeType: { type: String, required: true },
  predictionType: { type: String, enum: ["mean", "median", "mode"], required: true },
  predictedValue: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PrescriptionSchema = new mongoose.Schema({
  barangay: { type: String, required: true },
  municipality: { type: String, required: true },
  province: { type: String, required: true },
  crimeType: { type: String, required: true },
  recommendation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Crime = mongoose.models.Crime || mongoose.model('Crime', CrimeSchema);
const Barangay = mongoose.models.Barangay || mongoose.model('Barangay', BarangaySchema);
const Prediction = mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);
const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);

function toUpperSafe(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().toUpperCase();
}

function parseExcelDate(value) {
  // Accept either JS date string, Excel serial, or ISO
  if (!value && value !== 0) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    // Excel serial date: days since 1899-12-30
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = value * 24 * 60 * 60 * 1000;
    return new Date(epoch.getTime() + ms);
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

async function main() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crime-analytics';
  await mongoose.connect(mongoURI);
  console.log('🗄️  Connected to MongoDB');

  // Drop legacy unique indexes on caseId/caseNumber if present
  try {
    const indexes = await mongoose.connection.db.collection('crimes').indexes();
    const dropPromises = [];
    const cnIdx = indexes.find(i => i.key && i.key.caseNumber === 1 && i.unique);
    if (cnIdx) dropPromises.push(mongoose.connection.db.collection('crimes').dropIndex(cnIdx.name));
    const cidIdx = indexes.find(i => i.key && i.key.caseId === 1 && i.unique);
    if (cidIdx) dropPromises.push(mongoose.connection.db.collection('crimes').dropIndex(cidIdx.name));
    if (dropPromises.length) await Promise.allSettled(dropPromises);
  } catch (_) {}

  // Load barangay population from Excel or fallback JSON
  let populationMap = null; // keys: `${b}|${m}|${p}` and fallback `b`
  const populationEntries = []; // { name, municipality?, province?, country?, population }
  try {
    const excelPop = path.resolve(__dirname, 'data', 'lubaoPopulation.xlsx');
    if (fs.existsSync(excelPop)) {
      const wb = XLSX.readFile(excelPop);
      const sn = wb.SheetNames[0];
      const sh = wb.Sheets[sn];
      const arr = XLSX.utils.sheet_to_json(sh, { defval: '' });
      populationMap = new Map();
      for (const r of arr) {
        const b = toUpperSafe(r['Barangay'] || r['BARANGAY'] || r['Barangays'] || r['BARANGAYS'] || r['barangay'] || r['barangays']);
        const m = toUpperSafe(r['Municipality'] || r['municipality']);
        const p = toUpperSafe(r['Province'] || r['province']);
        const pop = Number(r['Population'] || r['population']);
        if (b && Number.isFinite(pop) && pop >= 0) {
          const fullKey = `${b}|${m}|${p}`;
          populationMap.set(fullKey, pop);
          if (!populationMap.has(b)) populationMap.set(b, pop);
          populationEntries.push({ name: b, municipality: m, province: p, population: pop });
        }
      }
    } else {
      const jsonPop = path.resolve(__dirname, 'data', 'barangay-population-lubao.json');
      if (fs.existsSync(jsonPop)) {
        const raw = fs.readFileSync(jsonPop, 'utf8');
        const arr = JSON.parse(raw);
        populationMap = new Map();
        for (const item of arr) {
          const key = toUpperSafe(item.barangay);
          const pop = Number(item.population);
          if (key && Number.isFinite(pop) && pop >= 0) {
            populationMap.set(key, pop);
            populationEntries.push({ name: key, population: pop });
          }
        }
      }
    }
  } catch (_) {
    populationMap = null;
  }
  if (!populationMap) {
    console.log('ℹ️  No population Excel/JSON found. Skipping population merge.');
  }

  const excelPath = path.resolve(__dirname, 'crime-dataset.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  let crimesInserted = 0;
  let skippedRows = 0;
  const skipReasons = { missingRequired: 0 };
  const barangayKeySet = new Set();
  const barangayNameToLoc = new Map(); // name -> { municipality, province, country }
  const bulkCrimes = [];

  for (const row of rows) {
    const caseId = String(row['case id'] || row['CASE ID'] || row['Case ID'] || '').trim();
    const type = String(row['Type'] || row['TYPE'] || '').trim();
    const caseNumber = String(row['Case Number'] || row['CASE NUMBER'] || '').trim();
    const status = String(row['Status'] || row['STATUS'] || '').trim();
    const gender = String(row['Gender'] || row['GENDER'] || '').trim();
    const age = row['Age'] || row['AGE'] || '';
    const civilStatus = String(row['Civil Status'] || row['CIVIL STATUS'] || '').trim();
    const confinementDateRaw = row['Confinement'] || row['CONFINEMENT'] || row['Confinement Date'] || '';
    const confinementTime = String(row['Time of Confinement'] || row['TIME OF CONFINEMENT'] || '').trim();
    const barangay = toUpperSafe(row['Barangay'] || row['BARANGAY']);
    const municipality = toUpperSafe(row['Municapality'] || row['Municipality'] || row['MUNICIPALITY']);
    const province = toUpperSafe(row['Province'] || row['PROVINCE']);
    const country = toUpperSafe(row['Country'] || row['COUNTRY'] || 'Philippines');

    const confinementDate = parseExcelDate(confinementDateRaw);
    let finalTime = confinementTime;
    if ((!finalTime || finalTime.length === 0) && confinementDate instanceof Date) {
      const h = confinementDate.getHours().toString().padStart(2, '0');
      const m = confinementDate.getMinutes().toString().padStart(2, '0');
      finalTime = `${h}:${m}`;
    }
    if (!type || !confinementDate || !barangay || !municipality || !province || !country) {
      skippedRows += 1;
      skipReasons.missingRequired += 1;
      continue; // skip incomplete rows
    }

    bulkCrimes.push({
      insertOne: {
        document: {
          ...(caseId ? { caseId } : {}),
          type,
          ...(caseNumber ? { caseNumber } : {}),
          status,
          gender,
          age: Number(age) || null,
          civilStatus,
          confinementDate,
          confinementTime: finalTime || '00:00',
          barangay,
          municipality,
          province,
          country
        }
      }
    });

    const bKey = `${barangay}|${municipality}|${province}|${country}`;
    barangayKeySet.add(bKey);
    if (!barangayNameToLoc.has(barangay)) {
      barangayNameToLoc.set(barangay, { municipality, province, country });
    }
  }

  if (bulkCrimes.length > 0) {
    try {
      const res = await Crime.bulkWrite(bulkCrimes, { ordered: false });
      crimesInserted = res.insertedCount || 0;
    } catch (e) {
      // ignore duplicate errors; insertedCount may be on result
      if (e && e.result && typeof e.result.getInsertedIds === 'function') {
        crimesInserted = e.result.getInsertedIds().length;
      }
    }
  }

  // Upsert barangays
  let barangayUpserts = 0;
  let barangayPopApplied = 0;
  const barangayOps = [];
  for (const key of barangayKeySet) {
    const [name, municipality, province, country] = key.split('|');
    const updateDoc = { $setOnInsert: { name, municipality, province, country } };
    if (populationMap) {
      const fullKey = `${name}|${municipality}|${province}`;
      let pop = populationMap.get(fullKey);
      if (typeof pop !== 'number') pop = populationMap.get(name);
      if (typeof pop === 'number') {
        updateDoc.$set = Object.assign({}, updateDoc.$set, { population: pop });
        barangayPopApplied += 1;
      }
    }
    barangayOps.push({
      updateOne: {
        filter: { name, municipality, province, country },
        update: updateDoc,
        upsert: true
      }
    });
  }
  if (barangayOps.length > 0) {
    const res = await Barangay.bulkWrite(barangayOps, { ordered: false });
    barangayUpserts = (res.upsertedCount || 0) + (res.modifiedCount || 0);
  }

  // Also upsert barangays that exist only in the population file
  if (populationEntries.length > 0) {
    const popOnlyOps = [];
    let addedFromPop = 0;
    for (const entry of populationEntries) {
      const name = entry.name;
      const inferred = barangayNameToLoc.get(name) || { municipality: 'LUBAO', province: 'PAMPANGA', country: 'PHILIPPINES' };
      const municipality = entry.municipality || inferred.municipality;
      const province = entry.province || inferred.province;
      const country = entry.country || inferred.country || 'PHILIPPINES';
      const key = `${name}|${municipality}|${province}|${country}`;
      if (!barangayKeySet.has(key)) {
        popOnlyOps.push({
          updateOne: {
            filter: { name, municipality, province, country },
            update: { $setOnInsert: { name, municipality, province, country }, $set: { population: entry.population } },
            upsert: true
          }
        });
        barangayKeySet.add(key);
        addedFromPop += 1;
      }
    }
    if (popOnlyOps.length > 0) {
      await Barangay.bulkWrite(popOnlyOps, { ordered: false });
      if (addedFromPop > 0) {
        console.log(`ℹ️  Added ${addedFromPop} barangays from population file`);
      }
    }
  }

  // Skip user seeding; using Firebase auth for a single app user

  // Seed predictions & prescriptions samples (3 each)
  const sampleCrimes = ['THEFT', 'ASSAULT', 'ROBBERY'];
  const anyBarangay = barangayKeySet.values().next().value;
  const [bName = 'UNKNOWN', bMun = 'UNKNOWN', bProv = 'UNKNOWN', bCountry = 'PHILIPPINES'] = (anyBarangay || '').split('|');

  const predictionsSeed = sampleCrimes.map((crimeType, idx) => ({
    barangay: bName || 'STA. CRUZ',
    municipality: bMun || 'LUBAO',
    province: bProv || 'PAMPANGA',
    crimeType,
    predictionType: ['mean', 'median', 'mode'][idx % 3],
    predictedValue: 50 + idx * 10
  }));
  await Prediction.insertMany(predictionsSeed, { ordered: false }).catch(() => {});

  const prescriptionsSeed = sampleCrimes.map((crimeType, idx) => ({
    barangay: bName || 'STA. CRUZ',
    municipality: bMun || 'LUBAO',
    province: bProv || 'PAMPANGA',
    crimeType,
    recommendation: idx === 0 ? 'Increase patrol visibility' : idx === 1 ? 'Improve street lighting' : 'Community watch program'
  }));
  await Prescription.insertMany(prescriptionsSeed, { ordered: false }).catch(() => {});

  // Heatmap generation including population and crime rate per 1000
  const aggregation = await Crime.aggregate([
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
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toUpper: '$name' }, { $toUpper: '$$b' }] },
                  { $eq: [{ $toUpper: '$municipality' }, { $toUpper: '$$m' }] },
                  { $eq: [{ $toUpper: '$province' }, { $toUpper: '$$p' }] },
                  { $eq: [{ $toUpper: '$country' }, { $toUpper: '$$c' }] }
                ]
              }
            }
          },
          { $project: { population: 1 } }
        ],
        as: 'barangayDoc'
      }
    },
    { $unwind: { path: '$barangayDoc', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        barangay: '$_id.barangay',
        municipality: '$_id.municipality',
        province: '$_id.province',
        country: '$_id.country',
        crimeCount: 1,
        population: '$barangayDoc.population'
      }
    },
    {
      $addFields: {
        crimeRatePer1000: {
          $cond: [
            { $and: [{ $ne: ['$population', null] }, { $gt: ['$population', 0] }] },
            { $round: [{ $multiply: [{ $divide: ['$crimeCount', '$population'] }, 1000] }, 1] },
            null
          ]
        }
      }
    },
    { $sort: { crimeCount: -1 } }
  ]);

  const outDir = path.resolve(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'heatmap.json');
  fs.writeFileSync(outPath, JSON.stringify(aggregation, null, 2));

  console.log(`✅ Imported ${crimesInserted} crimes`);
  // No updates when doing pure inserts
  if (skippedRows > 0) console.log(`⚠️  Skipped ${skippedRows} rows (missing required fields)`);
  console.log(`✅ Added/Updated ${barangayKeySet.size} barangays`);
  if (barangayPopApplied > 0) console.log(`ℹ️  Applied population for ${barangayPopApplied} barangays`);
  console.log(`✅ Seeded 3 predictions, 3 prescriptions`);
  console.log(`✅ Heatmap generated at ${outPath}`);

  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.connection.close(); } catch (_) {}
  process.exit(1);
});


