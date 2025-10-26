const { spawn } = require('child_process');
const path = require('path');

class MLService {
  constructor() {
    this.modelPath = path.join(__dirname, '../../artifacts/scheme_recommender.joblib');
    this.pythonPath = process.env.PYTHON_PATH || 'python';
  }

  /**
   * Get recommendations using the trained ML model
   * @param {Object} profile - User profile object
   * @param {number} topK - Number of recommendations to return
   * @returns {Promise<Array>} Array of recommended schemes
   */
  async getRecommendations(profile, topK = 10) {
    return new Promise((resolve, reject) => {
      try {
        // Prepare the profile data for the ML model
        const profileData = {
          age: profile.age,
          income: profile.income,
          caste_group: profile.caste_group,
          occupation: profile.occupation,
          gender: profile.gender,
          state: profile.state,
          interests: profile.interests || [],
          previous_applications: profile.previous_applications || []
        };

        // Spawn Python process to run the ML inference
        const pythonProcess = spawn(this.pythonPath, [
          path.join(__dirname, '../../inference.py'),
          '--model', this.modelPath,
          '--profile', JSON.stringify(profileData),
          '--top_k', topK.toString()
        ], {
          cwd: path.join(__dirname, '../..'),
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            console.error('Python process error:', stderr);
            reject(new Error(`ML inference failed with code ${code}: ${stderr}`));
            return;
          }

          try {
            const recommendations = JSON.parse(stdout);
            resolve(recommendations);
          } catch (parseError) {
            console.error('Failed to parse ML output:', stdout);
            reject(new Error('Failed to parse ML model output'));
          }
        });

        pythonProcess.on('error', (error) => {
          console.error('Failed to start Python process:', error);
          reject(new Error('Failed to start ML inference process'));
        });

      } catch (error) {
        console.error('ML service error:', error);
        reject(error);
      }
    });
  }

  /**
   * Check if the ML model is available
   * @returns {Promise<boolean>} True if model is available
   */
  async isModelAvailable() {
    return new Promise((resolve) => {
      const fs = require('fs');
      try {
        const modelExists = fs.existsSync(this.modelPath);
        resolve(modelExists);
      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * Get model information
   * @returns {Promise<Object>} Model information
   */
  async getModelInfo() {
    const isAvailable = await this.isModelAvailable();
    return {
      isAvailable,
      modelPath: this.modelPath,
      pythonPath: this.pythonPath
    };
  }
}

module.exports = new MLService();
