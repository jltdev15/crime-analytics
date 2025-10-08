#!/usr/bin/env node

// Manual AI Training Script
const mongoose = require('mongoose');
const synaptic = require('synaptic');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crime-analytics');

// Import models
const { Crime } = require('./dist/models');

const { Architect, Trainer } = synaptic;

async function trainAI() {
  try {
    console.log('🧠 Starting AI Training...');
    
    // Get crime data
    const crimes = await Crime.find({}).sort({ confinementDate: 1 });
    console.log(`📊 Found ${crimes.length} crime records`);
    
    if (crimes.length < 10) {
      console.log('❌ Insufficient data for training. Need at least 10 records.');
      return;
    }
    
    // Group by month
    const monthlyData = new Map();
    crimes.forEach(crime => {
      // Access raw data to get the actual date
      const rawCrime = crime.toObject();
      const date = rawCrime.confinementDate || rawCrime.confinement?.date || rawCrime.createdAt;
      if (date && !isNaN(new Date(date).getTime())) {
        try {
          const dateObj = new Date(date);
          const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
        } catch (error) {
          console.warn('Error processing date in training data:', date, error);
        }
      }
    });
    
    console.log(`📊 Found ${monthlyData.size} unique months`);
    
    // Create time series
    const timeSeries = Array.from(monthlyData.entries())
      .map(([dateStr, count]) => ({
        date: new Date(dateStr + '-01'),
        count
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    console.log(`📊 Time series length: ${timeSeries.length}`);
    
    // Create training data (6 months input -> 1 month output)
    const trainingData = [];
    for (let i = 6; i < timeSeries.length; i++) {
      const input = timeSeries.slice(i - 6, i).map(d => d.count);
      const output = [timeSeries[i].count];
      trainingData.push({ input, output });
    }
    
    console.log(`📊 Generated ${trainingData.length} training samples`);
    
    if (trainingData.length < 3) {
      console.log('❌ Insufficient training samples. Need at least 3.');
      return;
    }
    
    // Create and train neural network
    console.log('🔄 Creating neural network...');
    const network = new Architect.LSTM(6, 10, 5, 1);
    const trainer = new Trainer(network);
    
    console.log('🔄 Training neural network...');
    const result = trainer.train(trainingData, {
      rate: 0.05,
      iterations: 500,
      error: 0.01,
      shuffle: true,
      log: 50,
      cost: Trainer.cost.MSE
    });
    
    console.log('✅ AI Training Completed!');
    console.log(`📊 Training iterations: ${result.iterations}`);
    console.log(`📊 Final error: ${result.error.toFixed(6)}`);
    
    // Test prediction
    if (trainingData.length > 0) {
      const testInput = trainingData[0].input;
      const prediction = network.activate(testInput);
      console.log(`🎯 Test prediction: ${prediction[0].toFixed(2)} (actual: ${trainingData[0].output[0]})`);
    }
    
    console.log('\n🎉 AI is now trained and ready to make predictions!');
    console.log('💡 You can now use the frontend or API to get AI-powered forecasts.');
    
  } catch (error) {
    console.error('❌ Training failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run training
trainAI();
