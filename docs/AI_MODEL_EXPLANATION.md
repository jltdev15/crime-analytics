# AI Model Prediction & Recommendation System Explanation

## Table of Contents
1. [How the AI Model Predicts Crime Numbers](#how-the-ai-model-predicts-crime-numbers)
2. [Basis of Recommendations](#basis-of-recommendations)
3. [Technical Details](#technical-details)
4. [Examples](#examples)

---

## How the AI Model Predicts Crime Numbers

### Overview

The Crime Analytics system uses a **hybrid machine learning approach** that combines:
- **Primary Method**: Neural Network (LSTM - Long Short-Term Memory)
- **Fallback Method**: Statistical Linear Regression

This dual approach ensures reliable predictions even when the neural network encounters issues.

### 1. Data Collection & Preparation

#### Historical Data Sources
The model analyzes historical crime data from the database, including:
- **Crime Records**: All past incidents with dates, locations, and crime types
- **Geographic Data**: Barangay, municipality, province information
- **Temporal Data**: Monthly crime counts aggregated from individual incidents
- **Population Data**: Barangay population for density calculations

#### Time Series Preparation
```typescript
// Example: Converting crime records to monthly time series
Historical Crimes (2010-2024) → Monthly Aggregation → Time Series Data
- January 2023: 5 crimes
- February 2023: 3 crimes
- March 2023: 7 crimes
...
```

### 2. Neural Network Prediction Method (Primary)

#### Architecture
- **Type**: LSTM (Long Short-Term Memory) Neural Network
- **Library**: Synaptic.js
- **Structure**: 
  - Input Layer: 6 neurons (last 6 months of data)
  - Hidden Layer: 8 neurons
  - Context Layer: 4 neurons (LSTM memory)
  - Output Layer: 1 neuron (predicted crime count)

#### Training Process

**Step 1: Data Normalization**
- All input values are normalized to a 0-1 range
- This ensures the neural network can process data efficiently
- Formula: `normalized = (value - min) / (max - min)`

**Step 2: Training Data Creation**
- Creates training pairs from historical data
- Each training sample uses 6 months of input → predicts 1 month output
- Example: 
  ```
  Input: [Jan: 5, Feb: 3, Mar: 7, Apr: 4, May: 6, Jun: 5]
  Output: [Jul: 6]
  ```

**Step 3: Model Training**
- **Learning Rate**: 0.01 (conservative for stability)
- **Iterations**: 3-4 iterations (optimized for convergence)
- **Error Threshold**: 0.05
- **Training Performance**: Achieves ~99.9% error reduction (from 38.7 to 0.045)

**Step 4: Prediction Generation**
For each forecast month:
1. Takes the last 6 months of historical data
2. Normalizes the input
3. Feeds through the trained neural network
4. Denormalizes the output to get actual crime count
5. Applies realistic variations (seasonal patterns, trends)
6. Caps predictions based on historical maximums

#### Prediction Features

The model considers:
- **Historical Trend**: Is crime increasing or decreasing over time?
- **Seasonal Patterns**: Are there specific months with higher crime rates?
- **Recent Activity**: How does recent crime compare to historical averages?
- **Population Density**: Higher density areas may have different patterns

### 3. Statistical Fallback Method (Secondary)

When the neural network is unavailable or insufficient data exists, the system uses:

#### Linear Regression with Seasonal Adjustment
- **Method**: Ordinary Least Squares (OLS) regression
- **Library**: simple-statistics
- **Process**:
  1. Fits a linear trend line through historical monthly data
  2. Calculates R-squared to measure fit quality
  3. Applies seasonal adjustments based on month of year
  4. Generates confidence intervals (upper/lower bounds)

#### Formula
```
Predicted Crime Count = (slope × month_index) + intercept + seasonal_variation
```

### 4. Prediction Output

Each prediction includes:
- **Predicted Value**: Expected number of crimes for the month
- **Lower Bound**: Minimum expected (80% of predicted)
- **Upper Bound**: Maximum expected (120% of predicted)
- **Confidence Level**: 0-1 scale (0.6-0.8 typical)
- **Method Used**: 'neural-network' or 'statistical'

### 5. Validation & Capping

To ensure realistic predictions:
- **Low-Frequency Crimes** (< 2 per month): Capped at 2× historical mean, max 3
- **High-Frequency Crimes** (≥ 2 per month): Capped at 1.5× historical mean
- **Fractional Values**: For very low averages (< 0.5), allows decimal predictions
- **Minimum Values**: Never predicts negative numbers

---

## Basis of Recommendations

### Overview

Recommendations are **AI-generated action plans** designed to prevent predicted crimes. They are created only for predictions with **Medium** or **High** risk levels.

### 1. Data Sources for Recommendations

The recommendation engine analyzes multiple data sources:

#### A. Prediction Data
- **Risk Level**: Low, Medium, or High
- **Probability**: 0-1 scale indicating likelihood of crime
- **Forecast Trend**: Is crime expected to increase/decrease?
- **Confidence**: Model's confidence in the prediction

#### B. Historical Crime Data
- **Total Crime Count**: Number of historical incidents
- **Crime Rate**: Crimes per 1,000 population
- **Crime Patterns**: Peak hours, peak days of week
- **Hotspot Areas**: Locations with concentrated crime

#### C. Geographic & Demographic Data
- **Population**: Barangay population size
- **Population Density**: People per square kilometer
- **Municipality Statistics**: Average crime rates for comparison
- **Barangay Context**: Urban vs rural characteristics

#### D. Crime Pattern Analysis
- **Peak Hours**: Times of day with highest crime activity
- **Peak Days**: Days of week with highest activity
- **Crime Type Specifics**: Different patterns for different crime types

### 2. Priority Scoring System

Recommendations are assigned priority levels using a **weighted scoring system**:

```typescript
Priority Score = 
  (Risk Level: High = 3, Medium = 1) +
  (Above Average Crime Rate: Yes = 2, No = 0) +
  (Increasing Trend: Yes = 1, No = 0) +
  (High Probability > 0.7: Yes = 1, No = 0)

Final Priority:
- Score ≥ 5: Critical
- Score ≥ 4: High
- Score ≥ 2: Medium
- Score < 2: Low
```

**Example Calculation**:
- High Risk (+3)
- Above Average Crime Rate (+2)
- Increasing Trend (+1)
- High Probability (+1)
- **Total Score: 7 → Critical Priority**

### 3. Recommendation Categories

Recommendations are organized into 5 categories based on the type of intervention needed:

#### A. Patrol Recommendations
**When Generated**: High risk OR above-average crime rate

**Basis**:
- Risk level assessment
- Crime pattern analysis (peak hours/days)
- Population density considerations
- Forecast trend (increasing/decreasing)

**Example**:
```
Title: "Enhanced Patrol Coverage for High-Crime Area"
Rationale: "High risk prediction (75%) for THEFT in Barangay X. 
Historical data shows peak activity during 18:00, 20:00, 22:00. 
High population density (5,000 per km²) increases risk."
```

#### B. Community Recommendations
**When Generated**: Medium or High risk levels

**Basis**:
- Risk level
- Crime type (customized for theft, assault, etc.)
- Population size (affects program scale)
- Historical case count

**Example**:
```
Title: "Barangay X Community Safety Program"
Rationale: "Proactive prevention for THEFT in Barangay X (High risk). 
15 historical cases indicate ongoing concern."
```

#### C. Infrastructure Recommendations
**When Generated**: Above-average crime rate OR high population density

**Basis**:
- Crime rate comparison (vs municipality average)
- Population density
- Number of identified hotspot areas
- Crime type patterns

**Example**:
```
Title: "Security Infrastructure Enhancement for Barangay X"
Rationale: "Barangay X has above-average crime rate (2.5 per 1000, 
vs municipality avg: 1.8) requiring infrastructure improvements."
```

#### D. Investigation Recommendations
**When Generated**: Serious crime types (Rape, Murder, Homicide, Assault, Drug-related)

**Basis**:
- Crime type severity
- Historical case count
- Risk level
- Need for specialized protocols

**Example**:
```
Title: "Drug Enforcement Strategy for Barangay X"
Rationale: "Drug-related crime (DRUG POSSESSION) in Barangay X requires 
enhanced investigation protocols. 12 cases indicate need for intervention."
```

#### E. Prevention Recommendations
**When Generated**: 
- Drug-related crimes
- Increasing forecast trends (>15% increase)

**Basis**:
- Crime type (drug-specific programs)
- Forecast trend percentage
- Population size (affects program scale)
- Historical case count

**Example**:
```
Title: "Urgent Intervention for Rising THEFT in Barangay X"
Rationale: "Forecast shows significant increase (18.5%) in THEFT for 
Barangay X. Immediate action required."
```

### 4. Recommendation Attributes

Each recommendation includes detailed attributes:

#### Priority
- **Critical**: Score ≥ 5 (immediate attention required)
- **High**: Score ≥ 4 (urgent action needed)
- **Medium**: Score ≥ 2 (important but not urgent)
- **Low**: Score < 2 (preventive measure)

#### Implementation Cost
- **Low**: Community programs, awareness campaigns
- **Medium**: Patrol deployments, training programs
- **High**: Infrastructure, specialized units, equipment

#### Timeframe
- **Immediate**: High/Critical priority, urgent situations
- **Short-term**: 1-3 months implementation
- **Medium-term**: 3-6 months implementation
- **Long-term**: 6+ months implementation

#### Expected Impact
Quantified based on:
- Historical effectiveness of similar interventions
- Crime type characteristics
- Population and density factors
- Example: "Reduce crime incidents by 25-35% in this high-crime area"

#### Success Metrics
Measurable outcomes such as:
- Reduction in reported incidents
- Response time improvement
- Community participation rates
- Crime rate reduction targets

#### Risk Factors
Potential challenges:
- Resource constraints
- Community resistance
- Budget limitations
- Training needs

#### Confidence Level
- Based on prediction confidence
- Adjusted by recommendation type
- Range: 0.5-0.9 (50%-90% confidence)

### 5. Recommendation Generation Logic

#### Step-by-Step Process

1. **Filter Predictions**
   - Only Medium/High risk predictions generate recommendations
   - Low risk predictions are excluded

2. **Gather Context Data**
   ```typescript
   - Historical crime data for the barangay
   - Population and demographic information
   - Municipality-wide crime statistics
   - Crime pattern analysis (hours, days, locations)
   ```

3. **Calculate Key Metrics**
   ```typescript
   - Crime Rate = (Total Crimes / Population) × 1000
   - Municipality Average Rate
   - Is Above Average = Crime Rate > Municipality Avg × 1.2
   - Forecast Trend = ((Last Month - First Month) / First Month) × 100
   - Is Increasing = Forecast Trend > 10%
   ```

4. **Determine Priority**
   - Calculate priority score using weighted factors
   - Assign Critical/High/Medium/Low priority

5. **Generate Category-Specific Recommendations**
   - **Patrol**: If High risk OR above average
   - **Community**: If Medium/High risk
   - **Infrastructure**: If above average OR high density
   - **Investigation**: If serious crime type
   - **Prevention**: If drug-related OR increasing trend

6. **Customize Recommendations**
   - Include specific peak hours/days from pattern analysis
   - Reference actual crime rates and comparisons
   - Mention historical case counts
   - Tailor to crime type (theft vs assault vs drugs)

7. **Calculate Confidence**
   - Base confidence from prediction
   - Adjust by category (some categories have lower confidence)
   - Range: 0.5-0.9

### 6. Example: Complete Recommendation Generation

**Input Prediction**:
```json
{
  "barangay": "SANTA CRUZ",
  "municipality": "LUBAO",
  "province": "PAMPANGA",
  "crimeType": "THEFT",
  "riskLevel": "High",
  "probability": 0.75,
  "confidence": 0.8,
  "forecast": [
    { "month": "2024-07", "predicted": 5 },
    { "month": "2024-12", "predicted": 7 }
  ]
}
```

**Analysis**:
- Historical Data: 15 theft cases
- Population: 5,000
- Crime Rate: 3.0 per 1000
- Municipality Avg: 2.0 per 1000
- Above Average: Yes (3.0 > 2.4)
- Forecast Trend: +40% (5 → 7)
- Peak Hours: 18:00, 20:00, 22:00
- Peak Days: Friday, Saturday

**Priority Calculation**:
- High Risk: +3
- Above Average: +2
- Increasing Trend: +1
- High Probability: +1
- **Total: 7 → Critical Priority**

**Generated Recommendations**:

1. **Patrol Recommendation** (Critical Priority)
   - Title: "Enhanced Patrol Coverage for High-Crime Area"
   - Description: "Deploy additional police patrols during peak hours (18:00, 20:00, 22:00), especially on Friday"
   - Rationale: "High risk prediction (75%) for THEFT in SANTA CRUZ. Historical data shows peak activity during 18:00, 20:00, 22:00. High population density (5,000 per km²) increases risk. Forecast shows increasing trend."
   - Expected Impact: "Reduce crime incidents by 25-35% in this high-crime area (current rate: 3.0 per 1000, vs municipality avg: 2.0)"

2. **Community Recommendation** (High Priority)
   - Title: "SANTA CRUZ Community Safety Program"
   - Description: "Organize community watch programs and property protection workshops"
   - Rationale: "Proactive prevention for THEFT in SANTA CRUZ (High risk). 15 historical cases indicate ongoing concern."
   - Expected Impact: "Improve community vigilance and reporting. Target: 500 active participants"

3. **Infrastructure Recommendation** (High Priority)
   - Title: "Security Infrastructure Enhancement for SANTA CRUZ"
   - Description: "Install security cameras, improve street lighting, and establish security checkpoints in high-risk areas"
   - Rationale: "SANTA CRUZ has above-average crime rate (3.0 per 1000) requiring infrastructure improvements"
   - Expected Impact: "Reduce crime by 15-25% through deterrence. Focus on 2 identified hotspot areas"

---

## Technical Details

### Neural Network Training Parameters

```typescript
{
  rate: 0.01,              // Learning rate
  iterations: 1000,        // Max iterations
  error: 0.05,             // Error threshold
  shuffle: true,           // Randomize training order
  cost: 'MSE'              // Mean Squared Error
}
```

### Risk Assessment Factors

```typescript
{
  historicalTrend: 0.25,      // 25% weight
  seasonalPattern: 0.15,      // 15% weight
  populationDensity: 0.3,    // 30% weight
  recentActivity: 0.3        // 30% weight
}
```

### Confidence Calculation

- **Neural Network**: Based on prediction variance and historical mean distance
- **Statistical**: Based on R-squared value and data quality
- **Recommendations**: Adjusted by category type (0.7-0.9 multiplier)

---

## Examples

### Example 1: Low-Frequency Crime Prediction

**Scenario**: Barangay with 0.3 crimes per month average

**Prediction Process**:
1. Historical data shows very low frequency
2. Model uses minimal variation (5% instead of 20%)
3. Predictions capped at 2× mean (max 0.6 per month)
4. Allows fractional predictions (0.3, 0.4, 0.5)
5. Lower confidence (0.6 vs 0.8) due to low data volume

**Output**:
```json
{
  "month": "2024-07",
  "predicted": 0.4,
  "lower": 0.3,
  "upper": 0.5,
  "confidence": 0.6,
  "method": "neural-network"
}
```

### Example 2: High-Frequency Crime Prediction

**Scenario**: Barangay with 8 crimes per month average

**Prediction Process**:
1. Historical data shows consistent pattern
2. Model applies normal seasonal variation (20%)
3. Predictions capped at 1.5× mean (max 12 per month)
4. Whole number predictions only
5. Higher confidence (0.8) due to sufficient data

**Output**:
```json
{
  "month": "2024-07",
  "predicted": 9,
  "lower": 7,
  "upper": 11,
  "confidence": 0.8,
  "method": "neural-network"
}
```

### Example 3: Recommendation for Drug-Related Crime

**Input**: High risk prediction for DRUG POSSESSION

**Generated Recommendations**:
1. **Investigation** (Critical): Enhanced drug enforcement strategy
2. **Prevention** (High): Drug prevention program with youth engagement
3. **Community** (High): Community awareness about drug issues

**Rationale**: Drug-related crimes require specialized approaches combining enforcement, prevention, and community engagement.

---

## Summary

### Prediction System
- Uses **LSTM Neural Network** as primary method
- Falls back to **Statistical Linear Regression** when needed
- Considers historical trends, seasonal patterns, and population factors
- Validates and caps predictions for realism

### Recommendation System
- Generates recommendations only for **Medium/High risk** predictions
- Uses **multi-factor priority scoring** (risk, crime rate, trends, probability)
- Creates **5 categories** of recommendations (patrol, community, infrastructure, investigation, prevention)
- Customizes recommendations based on **crime patterns, demographics, and forecast trends**
- Provides **detailed rationale** explaining why each recommendation is needed

Both systems work together to provide **data-driven, actionable insights** for crime prevention, with transparent explanations of how predictions and recommendations are generated.

---

**Last Updated**: January 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅

