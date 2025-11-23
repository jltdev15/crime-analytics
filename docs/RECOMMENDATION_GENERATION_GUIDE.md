# Recommendation Generation Guide

## Overview

The Prescriptive Analytics system automatically generates **AI-driven crime prevention recommendations** based on predictive analytics. These recommendations are personalized action plans designed to prevent predicted crimes in specific barangays.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [How Recommendations Are Generated](#how-recommendations-are-generated)
3. [Data Sources](#data-sources)
4. [Priority Scoring System](#priority-scoring-system)
5. [Recommendation Categories](#recommendation-categories)
6. [Generation Process](#generation-process)
7. [Example Scenarios](#example-scenarios)
8. [API Endpoints](#api-endpoints)
9. [Frontend Integration](#frontend-integration)
10. [Recommendation Structure](#recommendation-structure)

---

## Prerequisites

Before recommendations can be generated, the system requires:

1. **Predictions Must Exist**: Recommendations are only generated for predictions with **Medium** or **High** risk levels
2. **Historical Crime Data**: The system needs historical crime records to analyze patterns
3. **Barangay Population Data**: Population information is used to calculate crime rates and density

### Generating Predictions First

```bash
# Generate predictions first (if not already done)
POST /api/predict/generate/predictions
```

---

## How Recommendations Are Generated

### Triggering Generation

Recommendations can be generated in two ways:

1. **Via API Endpoint** (Admin):
   ```bash
   POST /api/predict/generate/recommendations
   ```

2. **Via Frontend UI**:
   - Navigate to Prescriptive Analytics page
   - Click "Generate Recommendations" button
   - The system will:
     - Clear existing recommendations
     - Find all Medium/High risk predictions
     - Generate personalized recommendations for each

### Generation Flow

```
1. Clear existing recommendations
   ↓
2. Query all predictions with Medium/High risk
   ↓
3. For each prediction:
   ├─ Gather contextual data
   ├─ Calculate metrics (crime rate, trends, etc.)
   ├─ Determine priority level
   ├─ Generate category-specific recommendations
   └─ Save to database
   ↓
4. Return success message with count
```

---

## Data Sources

The recommendation engine analyzes multiple data sources to create personalized recommendations:

### 1. Prediction Data
- **Risk Level**: Low, Medium, or High
- **Probability**: 0-1 scale indicating likelihood of crime
- **Forecast Trend**: Expected increase/decrease in crime
- **Confidence**: Model's confidence in the prediction
- **Forecast Array**: 6-month forecast with predicted values

### 2. Historical Crime Data
- **Total Crime Count**: Number of historical incidents for the barangay/crime type
- **Crime Rate**: Crimes per 1,000 population
- **Time Patterns**: Peak hours and days of week
- **Trend Analysis**: Historical trend (increasing/decreasing)

### 3. Geographic & Demographic Data
- **Population**: Barangay population size
- **Population Density**: People per square kilometer
- **Municipality Statistics**: Average crime rates for comparison
- **Barangay Context**: Urban vs rural characteristics

### 4. Crime Pattern Analysis
- **Peak Hours**: Times of day with highest crime activity (e.g., "18:00", "20:00", "22:00")
- **Peak Days**: Days of week with highest activity (e.g., "Friday", "Saturday")
- **Hotspot Areas**: Locations with concentrated crime (future enhancement)

---

## Priority Scoring System

Recommendations are assigned priority levels using a **weighted scoring system**:

### Priority Score Calculation

```typescript
Priority Score = 
  (Risk Level: High = 3, Medium = 1) +
  (Above Average Crime Rate: Yes = 2, No = 0) +
  (Increasing Trend: Yes = 1, No = 0) +
  (High Probability > 0.7: Yes = 1, No = 0)
```

### Priority Assignment

| Score | Priority Level |
|-------|---------------|
| ≥ 5   | Critical      |
| ≥ 4   | High          |
| ≥ 2   | Medium        |
| < 2   | Low           |

### Example Priority Calculation

**Scenario**: 
- Risk Level: High (3 points)
- Above Average: Yes (2 points)
- Increasing Trend: Yes (1 point)
- High Probability: No (0 points)
- **Total Score: 6** → **Priority: Critical**

---

## Recommendation Categories

The system generates recommendations in **5 categories**, each with specific triggers:

### 1. Patrol Recommendations

**Trigger Conditions:**
- Risk Level = High **OR**
- Crime Rate > Municipality Average × 1.2

**What It Includes:**
- Peak hours for patrol deployment
- Peak days for increased coverage
- Population density considerations
- Specific crime type focus

**Example Output:**
```json
{
  "category": "patrol",
  "priority": "High",
  "title": "Enhanced Patrol Coverage for High-Crime Area",
  "description": "Deploy additional police patrols during peak hours (18:00, 20:00, 22:00), especially on Friday. High population density area requires increased visibility",
  "timeframe": "Immediate",
  "implementationCost": "High"
}
```

### 2. Community Recommendations

**Trigger Conditions:**
- Risk Level = Medium **OR** High

**What It Includes:**
- Crime-type specific programs (theft prevention, conflict resolution, etc.)
- Community watch programs
- Awareness campaigns
- Population-adjusted scale

**Example Output:**
```json
{
  "category": "community",
  "priority": "Medium",
  "title": "SANTA CRUZ Community Safety Program",
  "description": "Organize community watch programs and property protection workshops. Large community requires multiple sessions across different zones",
  "timeframe": "Short-term",
  "implementationCost": "Medium"
}
```

### 3. Infrastructure Recommendations

**Trigger Conditions:**
- Crime Rate > Municipality Average × 1.2 **OR**
- Population Density > 5 per 1000

**What It Includes:**
- Security camera installation
- Street lighting improvements
- Security checkpoints
- Hotspot area focus

**Example Output:**
```json
{
  "category": "infrastructure",
  "priority": "High",
  "title": "Security Infrastructure Enhancement for SANTA CRUZ",
  "description": "Install security cameras, improve street lighting, and establish security checkpoints in high-risk areas",
  "timeframe": "Medium-term",
  "implementationCost": "High"
}
```

### 4. Investigation Recommendations

**Trigger Conditions:**
- Crime Type is serious (RAPE, MURDER, HOMICIDE, ASSAULT, DRUGS, etc.)

**What It Includes:**
- Specialized investigation procedures
- Victim support services
- Drug enforcement strategies
- Enhanced protocols

**Example Output:**
```json
{
  "category": "investigation",
  "priority": "Critical",
  "title": "Drug Enforcement Strategy for SANTA CRUZ",
  "description": "Implement specialized drug investigation procedures, community outreach, and rehabilitation programs",
  "timeframe": "Immediate",
  "implementationCost": "High"
}
```

### 5. Prevention Recommendations

**Trigger Conditions:**
- Drug-related crime type **OR**
- Increasing trend > 15%

**What It Includes:**
- Drug prevention programs
- Youth engagement activities
- Urgent intervention for rising crime
- Community education

**Example Output:**
```json
{
  "category": "prevention",
  "priority": "High",
  "title": "Urgent Intervention for Rising THEFT in SANTA CRUZ",
  "description": "Implement immediate intervention measures to address the 18.5% projected increase in THEFT",
  "timeframe": "Immediate",
  "implementationCost": "High"
}
```

---

## Generation Process

### Step-by-Step Algorithm

For each prediction with Medium/High risk:

#### Step 1: Gather Contextual Data
```typescript
const [historicalData, barangayInfo, municipalityStats, crimePatterns] = 
  await Promise.all([
    getHistoricalData(barangay, municipality, province, crimeType),
    getPopulation(barangay, municipality, province),
    getMunicipalityCrimeStats(municipality, province),
    analyzeCrimePatterns(barangay, municipality, province, crimeType)
  ]);
```

#### Step 2: Calculate Key Metrics
```typescript
// Crime Rate Calculation
const crimeRate = (totalCrimes / population) * 1000;

// Municipality Comparison
const isAboveAverage = crimeRate > municipalityAvgRate * 1.2;

// Forecast Trend Analysis
const forecastTrend = ((lastMonth - firstMonth) / firstMonth) * 100;
const isIncreasing = forecastTrend > 10;
```

#### Step 3: Determine Priority
```typescript
const priorityScore = 
  (riskLevel === 'High' ? 3 : 1) + 
  (isAboveAverage ? 2 : 0) + 
  (isIncreasing ? 1 : 0) +
  (probability > 0.7 ? 1 : 0);

const finalPriority = 
  priorityScore >= 5 ? 'Critical' : 
  priorityScore >= 4 ? 'High' : 
  priorityScore >= 2 ? 'Medium' : 'Low';
```

#### Step 4: Generate Category-Specific Recommendations

The system checks each category's trigger conditions and generates recommendations accordingly:

1. **Patrol**: If High risk OR above average
2. **Community**: If Medium/High risk
3. **Infrastructure**: If above average OR high density
4. **Investigation**: If serious crime type
5. **Prevention**: If drug-related OR increasing trend

#### Step 5: Customize Recommendations

Each recommendation is personalized with:
- Specific peak hours/days from pattern analysis
- Actual crime rates and comparisons
- Historical case counts
- Crime type-specific language
- Population-adjusted targets

#### Step 6: Calculate Confidence

```typescript
// Base confidence from prediction
let confidence = prediction.confidence;

// Adjust by category
if (category === 'community') confidence *= 0.8;
if (category === 'infrastructure') confidence *= 0.75;
if (category === 'investigation') confidence *= 0.9;
if (category === 'prevention') confidence *= 0.7;

// Final confidence range: 0.5 - 0.9
```

#### Step 7: Save to Database

Each recommendation is saved with:
- All prediction context (barangay, municipality, province, crimeType)
- Generated recommendation details
- Default status: 'pending'

---

## Example Scenarios

### Scenario 1: High-Risk Theft in Urban Area

**Input Prediction:**
```json
{
  "barangay": "SANTA CRUZ",
  "municipality": "Lubao",
  "province": "Pampanga",
  "crimeType": "THEFT",
  "riskLevel": "High",
  "probability": 0.75,
  "confidence": 0.82
}
```

**Generated Recommendations:**

1. **Patrol** (Priority: Critical)
   - Peak hours: 18:00, 20:00, 22:00
   - Peak day: Friday
   - High population density consideration

2. **Community** (Priority: High)
   - Community watch programs
   - Property protection workshops
   - Multiple sessions for large population

3. **Infrastructure** (Priority: High)
   - Security cameras
   - Street lighting
   - Security checkpoints

### Scenario 2: Medium-Risk Drug Crime with Increasing Trend

**Input Prediction:**
```json
{
  "barangay": "SANTA CRUZ",
  "crimeType": "DRUG POSSESSION",
  "riskLevel": "Medium",
  "probability": 0.65,
  "forecastTrend": 18.5%
}
```

**Generated Recommendations:**

1. **Community** (Priority: Medium)
   - Drug awareness programs
   - Community engagement

2. **Investigation** (Priority: High)
   - Specialized drug investigation
   - Community outreach
   - Rehabilitation programs

3. **Prevention** (Priority: High)
   - Drug prevention program
   - Youth engagement
   - Urgent intervention (due to 18.5% increase)

---

## API Endpoints

### Generate Recommendations

**Endpoint:** `POST /api/predict/generate/recommendations`

**Description:** Generates recommendations for all Medium/High risk predictions

**Request:**
```bash
POST /api/predict/generate/recommendations
```

**Response:**
```json
{
  "message": "Enhanced recommendations generated successfully",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Note:** This endpoint:
- Clears all existing recommendations
- Processes all Medium/High risk predictions
- May take several minutes for large datasets

### Get Recommendations

**Endpoint:** `GET /api/predict/recommendations`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `barangay` (optional, case-insensitive search)
- `municipality` (optional, case-insensitive search)
- `province` (optional, case-insensitive search)
- `category` (optional: patrol, community, investigation, prevention, infrastructure)
- `priority` (optional: Low, Medium, High, Critical)
- `status` (optional: pending, approved, implemented, rejected)

**Example:**
```bash
GET /api/predict/recommendations?page=1&limit=10&priority=High&category=patrol
```

**Response:**
```json
{
  "recommendations": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Get Predictions with Recommendations

**Endpoint:** `GET /api/predict/predictions-with-recommendations`

**Description:** Returns predictions grouped with their recommendations

**Query Parameters:** Same as recommendations endpoint, plus:
- `crimeType` (optional)
- `riskLevel` (optional: Low, Medium, High)

**Response:**
```json
{
  "predictions": [
    {
      "prediction": { ... },
      "recommendations": [ ... ]
    }
  ],
  "pagination": { ... }
}
```

### Update Recommendation Status

**Endpoint:** `PUT /api/predict/recommendations/:id`

**Request Body:**
```json
{
  "status": "implemented",
  "notes": "Successfully implemented",
  "assignedTo": "Officer John Doe"
}
```

**Response:**
```json
{
  "_id": "...",
  "status": "implemented",
  "notes": "Successfully implemented",
  ...
}
```

---

## Frontend Integration

### Generating Recommendations

In the Prescriptive Analytics view (`Prescriptive.vue`):

```typescript
const generateRecommendations = async () => {
  loading.value = true
  try {
    await axios.post(`${API_BASE}/predict/generate/recommendations`)
    await fetchRecommendations()
  } catch (error) {
    console.error('Error generating recommendations:', error)
  } finally {
    loading.value = false
  }
}
```

### Fetching Recommendations

```typescript
const fetchRecommendations = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters // priority, category, status, barangay
    }
    
    const response = await axios.get(
      `${API_BASE}/predict/recommendations`, 
      { params }
    )
    
    recommendations.value = response.data.recommendations || []
    // Update pagination, counts, etc.
  } catch (error) {
    console.error('Error fetching recommendations:', error)
  } finally {
    loading.value = false
  }
}
```

### Grouping by Prediction

The frontend supports viewing recommendations grouped by their associated predictions:

```typescript
// Fetch predictions with recommendations grouped
const response = await axios.get(
  `${API_BASE}/predict/predictions-with-recommendations`, 
  { params }
)

predictionGroups.value = response.data.predictions || []
```

---

## Recommendation Structure

### Database Schema

```typescript
interface IRecommendation {
  // Location Context
  barangay: string;
  municipality: string;
  province: string;
  country: string;
  crimeType?: string;
  
  // Recommendation Details
  category: 'patrol' | 'community' | 'investigation' | 'prevention' | 'infrastructure';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  rationale: string;
  expectedImpact: string;
  
  // Implementation Details
  implementationCost: 'Low' | 'Medium' | 'High';
  timeframe: 'Immediate' | 'Short-term' | 'Medium-term' | 'Long-term';
  successMetrics: string[];
  riskFactors: string[];
  
  // Confidence & Status
  confidence: number; // 0-1 scale
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  assignedTo?: string;
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Example Recommendation Object

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "barangay": "SANTA CRUZ",
  "municipality": "Lubao",
  "province": "Pampanga",
  "country": "PHILIPPINES",
  "crimeType": "THEFT",
  "category": "patrol",
  "priority": "Critical",
  "title": "Enhanced Patrol Coverage for High-Crime Area",
  "description": "Deploy additional police patrols during peak hours (18:00, 20:00, 22:00), especially on Friday. High population density area requires increased visibility",
  "rationale": "High risk prediction (75.0%) for THEFT in SANTA CRUZ. Historical data shows peak activity during 18:00, 20:00, 22:00. High population density (8500 per km²) increases risk. Forecast shows increasing trend",
  "expectedImpact": "Reduce crime incidents by 25-35% in this high-crime area (current rate: 12.5 per 1000, vs municipality avg: 8.3)",
  "implementationCost": "High",
  "timeframe": "Immediate",
  "successMetrics": [
    "Reduction in reported incidents",
    "Response time improvement",
    "Crime rate reduction to below 9.1 per 1000"
  ],
  "riskFactors": [
    "Resource constraints",
    "Community resistance",
    "High population density requires more resources"
  ],
  "confidence": 0.82,
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Key Features

### 1. Personalized Recommendations
- Each recommendation is tailored to specific barangay, crime type, and risk level
- Includes actual data points (crime rates, peak hours, etc.)
- References historical case counts

### 2. Multi-Factor Priority System
- Considers risk level, crime rate, trends, and probability
- Ensures critical recommendations are prioritized

### 3. Category-Specific Logic
- Different categories have different trigger conditions
- Each category generates contextually appropriate recommendations

### 4. Confidence Scoring
- Base confidence from prediction model
- Adjusted by recommendation category
- Range: 0.5 - 0.9 (50% - 90%)

### 5. Success Metrics & Risk Factors
- Each recommendation includes measurable success metrics
- Identifies potential risk factors for implementation

---

## Best Practices

### When to Generate Recommendations

1. **After Generating New Predictions**: Always generate recommendations after creating new predictions
2. **After Data Updates**: When new crime data is imported, regenerate predictions and recommendations
3. **Regular Updates**: Consider weekly/monthly regeneration to keep recommendations current

### Filtering Recommendations

Use filters to focus on:
- **Priority**: Focus on Critical/High priority first
- **Category**: Address specific intervention types
- **Status**: Track implementation progress
- **Barangay**: Focus on specific areas

### Implementation Workflow

1. **Review**: Check pending recommendations
2. **Approve**: Mark high-priority items as approved
3. **Assign**: Assign to responsible officers/teams
4. **Implement**: Execute the recommendations
5. **Track**: Monitor success metrics
6. **Update Status**: Mark as implemented when complete

---

## Troubleshooting

### No Recommendations Generated

**Possible Causes:**
1. No predictions exist with Medium/High risk
2. Predictions haven't been generated yet
3. Database connection issues

**Solution:**
```bash
# 1. Generate predictions first
POST /api/predict/generate/predictions

# 2. Then generate recommendations
POST /api/predict/generate/recommendations
```

### Recommendations Not Appearing in Frontend

**Check:**
1. Filters may be too restrictive
2. Pagination may be on a different page
3. API endpoint may be incorrect

**Solution:**
- Clear all filters
- Check browser console for errors
- Verify API base URL in environment variables

### Low Confidence Recommendations

**Explanation:**
- Low-frequency crimes have lower confidence
- Some categories (community, infrastructure) have adjusted confidence
- This is expected behavior

**Action:**
- Review recommendations with lower confidence carefully
- Consider additional data collection for better accuracy

---

## Summary

The recommendation generation system:

1. ✅ **Automatically generates** personalized recommendations from predictions
2. ✅ **Uses multiple data sources** for context-aware recommendations
3. ✅ **Prioritizes** recommendations using weighted scoring
4. ✅ **Categorizes** recommendations into 5 intervention types
5. ✅ **Provides** implementation details, success metrics, and risk factors
6. ✅ **Integrates** seamlessly with frontend for review and management

For more information about the predictive analytics system, see:
- [AI Model Explanation](./AI_MODEL_EXPLANATION.md)
- [Predictive Analytics Documentation](./PREDICTIVE_ANALYTICS_DOCUMENTATION.md)
- [API Reference Guide](./API_REFERENCE_GUIDE.md)

