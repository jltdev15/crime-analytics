# 🚨 Crime Risk Categorization Guide

## Overview

The Crime Analytics system categorizes barangays (districts) into three risk levels based on their crime rates per 1,000 population. This categorization helps law enforcement and local government prioritize resources and interventions.

## 📊 Risk Categories

### 🔴 High Risk Areas
- **Criteria**: Crime Rate > 10 per 1,000 population
- **Color Code**: Red (#ef4444)
- **Description**: Areas with significantly elevated crime rates requiring immediate attention
- **Example**: SAN NICOLAS 1ST with 12.37 crimes per 1,000 population

### 🟡 Medium Risk Areas  
- **Criteria**: Crime Rate 5-10 per 1,000 population
- **Color Code**: Yellow (#eab308)
- **Description**: Areas with moderate crime rates that need monitoring and preventive measures
- **Example**: SANTA LUCIA with 7.50 crimes per 1,000 population

### 🟢 Low Risk Areas
- **Criteria**: Crime Rate < 5 per 1,000 population
- **Color Code**: Green (#22c55e)
- **Description**: Areas with relatively low crime rates, including those with zero crimes
- **Examples**: 
  - Areas with 0 crimes (10 barangays)
  - Areas with 1-4 crimes per 1,000 population (32 barangays)

## 🧮 Calculation Method

### Crime Rate Formula
```
Crime Rate = (Total Crimes / Population) × 1000
```

### Example Calculation
For SANTA CRUZ barangay:
- **Total Crimes**: 62
- **Population**: 17,700
- **Crime Rate**: (62 ÷ 17,700) × 1000 = 3.50 per 1,000

## 📈 Current Statistics (Lubao Municipality)

| Risk Level | Count | Percentage | Description |
|------------|-------|------------|-------------|
| **High Risk** | 1 | 2.3% | 1 barangay with >10 crimes/1000 |
| **Medium Risk** | 1 | 2.3% | 1 barangay with 5-10 crimes/1000 |
| **Low Risk** | 42 | 95.4% | 42 barangays with <5 crimes/1000 |
| **Total** | 44 | 100% | All barangays in Lubao |

## 🎯 Risk Distribution Details

### High Risk Barangays (1)
- **SAN NICOLAS 1ST**: 12.37 crimes/1000 (23 crimes, 1,860 population)

### Medium Risk Barangays (1)  
- **SANTA LUCIA**: 7.50 crimes/1000 (19 crimes, 2,535 population)

### Low Risk Barangays (42)
Includes:
- **Zero Crime Areas (10)**: BANCAL SINUBLI, REMEDIOS, SAN JOSE GUMI, SAN JUAN, SAN PEDRO SAUG, SAN ROQUE ARBOL, SANTIAGO, SANTO CRISTO, DE LA PAZ, DON IGNACIO DIMSON
- **Low Crime Areas (32)**: All other barangays with 0.44-4.23 crimes/1000

## 🔍 Technical Implementation

### Frontend Logic (Vue.js)
```javascript
// Risk categorization in IncidentMap.vue
const highRiskCount = computed(() => 
  mapData.value.filter(item => item.crimeRate !== null && item.crimeRate > 10).length
)

const mediumRiskCount = computed(() => 
  mapData.value.filter(item => item.crimeRate !== null && item.crimeRate >= 5 && item.crimeRate <= 10).length
)

const lowRiskCount = computed(() => 
  mapData.value.filter(item => item.crimeRate !== null && item.crimeRate < 5).length
)
```

### Risk Level Calculation
```javascript
const calculateRiskLevel = (crimeRate: number | null): 'high' | 'medium' | 'low' => {
  if (crimeRate === null) return 'low'
  if (crimeRate > 10) return 'high'
  if (crimeRate >= 5) return 'medium'
  return 'low'
}
```

## 🗺️ Visual Representation

### Map Markers
- **Red Circles**: High risk areas with pulsing animation
- **Yellow Circles**: Medium risk areas
- **Green Circles**: Low risk areas

### Interactive Features
- **Hover Effects**: Show detailed crime statistics
- **Popup Information**: Display crime count, population, and risk level
- **Pulsing Animation**: High risk areas pulse to draw attention

## 📊 Data Sources

### Crime Data
- **Source**: Police incident reports
- **Time Period**: 2010-2024
- **Total Records**: 387 crime incidents
- **Coverage**: 37 out of 44 barangays have recorded crimes

### Population Data
- **Source**: Municipal population records
- **Total Population**: 177,000+ across all barangays
- **Average per Barangay**: ~4,000 residents

## 🎯 Use Cases

### For Law Enforcement
- **Resource Allocation**: Deploy more patrols to high-risk areas
- **Crime Prevention**: Focus community programs on medium-risk areas
- **Success Metrics**: Track reduction in high-risk areas over time

### For Local Government
- **Budget Planning**: Allocate resources based on risk levels
- **Community Programs**: Target interventions in medium-risk areas
- **Development Planning**: Consider crime rates in urban planning

### For Community
- **Awareness**: Understand local crime patterns
- **Safety Planning**: Make informed decisions about areas to avoid
- **Community Action**: Participate in crime prevention programs

## 🔄 Updates and Maintenance

### Data Refresh
- **Frequency**: Monthly updates recommended
- **Process**: Import new crime data and recalculate risk levels
- **Validation**: Verify population data accuracy

### Threshold Adjustments
The risk thresholds can be adjusted based on:
- **Historical Trends**: Changes in overall crime rates
- **Regional Standards**: Comparison with other municipalities
- **Policy Requirements**: Government-set benchmarks

## 📈 Future Enhancements

### Planned Features
- **Dynamic Thresholds**: Adjustable risk criteria
- **Trend Analysis**: Historical risk level changes
- **Predictive Risk**: AI-powered future risk assessment
- **Comparative Analysis**: Risk levels vs. other municipalities

### Advanced Analytics
- **Seasonal Patterns**: Risk variations by time of year
- **Crime Type Analysis**: Risk by specific crime categories
- **Demographic Factors**: Population density impact on risk

---

**Last Updated**: January 2024  
**Data Source**: Lubao Municipality Crime Records  
**System Version**: 1.0.0  
**Status**: Production Ready ✅
