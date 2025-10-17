# 🎯 Predictive Analytics Frontend Guide

## Overview

This guide explains how to use the Predictive Analytics features in the Vue.js frontend application.

## 🚀 Getting Started

### 1. Access the Predictive Analytics Page

Navigate to the **Predictive Analytics** page from the main navigation menu.

### 2. Understanding the Dashboard

The Predictive Analytics dashboard displays:

- **AI Model Status**: Shows if the neural network is trained and active
- **Model Performance**: Displays training metrics and confidence levels
- **6-Month Incident Forecast**: Chart showing predicted crime trends
- **Barangay Risk Predictions**: Risk assessment for different areas
- **Prediction Alerts**: High-risk areas requiring attention

## 🔧 Interactive Features

### Retrain AI Model

Click the **"Retrain AI Model"** button to:
- Train the neural network with latest data
- Update prediction accuracy
- Refresh all forecasts

**Note**: Training may take 30-60 seconds to complete.

### Refresh Data

Click the **"Refresh"** button to:
- Update all prediction data
- Check model performance status
- Reload charts and metrics

## 📊 Understanding the Charts

### 6-Month Incident Forecast

- **Blue Line**: Historical crime data
- **Red Line**: AI predictions
- **Gray Area**: Confidence interval
- **Method Tag**: Shows if prediction used "AI" or "Statistical" method

### Barangay Risk Predictions

- **Risk Levels**: Low (Green), Medium (Yellow), High (Red)
- **Probability**: Risk percentage (0-100%)
- **Trend**: Increasing, Decreasing, or Stable

### Prediction Alerts

- **High Priority**: Areas with >70% risk probability
- **Medium Priority**: Areas with 40-70% risk probability
- **Recommendations**: Specific actions for each area

## 🎨 UI Components

### Status Cards

1. **AI Model Status**
   - Green: Model trained and active
   - Yellow: Model training in progress
   - Red: Model failed, using statistical fallback

2. **Model Performance**
   - **Neural Network**: Training status and confidence
   - **Statistical**: Always available as backup
   - **Hybrid**: Combined system status

3. **Prediction Summary**
   - Total predictions generated
   - Method used (AI vs Statistical)
   - Last updated timestamp

### Charts and Visualizations

1. **Forecast Chart**
   - Interactive tooltips
   - Zoom and pan capabilities
   - Export functionality

2. **Risk Assessment Table**
   - Sortable columns
   - Filter by risk level
   - Search functionality

3. **Alert Cards**
   - Priority indicators
   - Action buttons
   - Status updates

## 🔄 Data Flow

```
User Action (Retrain/Refresh)
         ↓
API Call to Backend
         ↓
Neural Network Training
         ↓
Prediction Generation
         ↓
Data Visualization Update
```

## 🚨 Troubleshooting

### Common Issues

1. **"Model Not Trained" Error**
   - Click "Retrain AI Model" button
   - Wait for training to complete
   - Check network connection

2. **Charts Not Loading**
   - Refresh the page
   - Check browser console for errors
   - Verify API server is running

3. **Slow Performance**
   - Training takes time (30-60 seconds)
   - Large datasets may cause delays
   - Consider using statistical fallback

### Error Messages

- **"Training Failed"**: Check server logs, try again
- **"No Data Available"**: Verify database connection
- **"Network Error"**: Check API server status

## 📱 Responsive Design

The dashboard is optimized for:
- **Desktop**: Full feature set with all charts
- **Tablet**: Condensed layout with essential features
- **Mobile**: Simplified view with key metrics

## 🎯 Best Practices

### For Users

1. **Regular Updates**: Retrain the model weekly for best accuracy
2. **Monitor Alerts**: Check high-risk areas regularly
3. **Verify Predictions**: Compare with actual crime data
4. **Use Filters**: Focus on specific areas or crime types

### For Developers

1. **Error Handling**: Always provide fallback options
2. **Loading States**: Show progress indicators during training
3. **Data Validation**: Verify prediction accuracy
4. **Performance**: Optimize for large datasets

## 🔮 Future Features

### Planned Enhancements

1. **Real-time Updates**: Automatic model retraining
2. **Custom Filters**: Advanced filtering options
3. **Export Data**: Download predictions as CSV/PDF
4. **Notifications**: Alert system for high-risk areas
5. **Mobile App**: Native mobile application

### User Experience Improvements

1. **Interactive Maps**: Visual risk assessment
2. **Trend Analysis**: Historical comparison tools
3. **Custom Dashboards**: Personalized views
4. **Report Generation**: Automated reports

## 📚 Technical Details

### Frontend Technologies

- **Vue 3**: Component-based framework
- **Chart.js**: Data visualization
- **Axios**: HTTP client for API calls
- **TailwindCSS**: Styling framework

### API Integration

- **Base URL**: `http://localhost:3001/api`
- **Authentication**: Firebase integration
- **Error Handling**: Centralized error management
- **Loading States**: User feedback during operations

## 🆘 Support

### Getting Help

1. **Check Console**: Browser developer tools for errors
2. **API Status**: Verify backend server is running
3. **Documentation**: Refer to API documentation
4. **Logs**: Check server logs for detailed errors

### Contact Information

For technical support or feature requests, please contact the development team or refer to the system documentation.

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
