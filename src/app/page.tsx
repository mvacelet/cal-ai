'use client';

// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
import { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface NutritionData {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  tip: string;
}

interface MealEntry {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: Date;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parses the nutrition analysis result from the API into structured data
 * @param result - Raw string response from the nutrition analysis API
 * @returns Structured NutritionData object
 */
function parseNutritionResult(result: string): NutritionData {
  const lines = result.split('\n');
  const nutritionData: NutritionData = {
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    tip: ''
  };

  let tipFound = false;
  //let tipLines: string[] = [];
  const tipLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Use precise regex patterns to match exact format at line start
    if (/^calories:\s*/i.test(trimmedLine)) {
      nutritionData.calories = trimmedLine.replace(/^calories:\s*/i, '').trim();
    } else if (/^protein:\s*/i.test(trimmedLine)) {
      nutritionData.protein = trimmedLine.replace(/^protein:\s*/i, '').trim();
    } else if (/^carbs:\s*/i.test(trimmedLine)) {
      nutritionData.carbs = trimmedLine.replace(/^carbs:\s*/i, '').trim();
    } else if (/^fat:\s*/i.test(trimmedLine)) {
      nutritionData.fat = trimmedLine.replace(/^fat:\s*/i, '').trim();
    } else if (/^tip:\s*/i.test(trimmedLine)) {
      tipFound = true;
      nutritionData.tip = trimmedLine.replace(/^tip:\s*/i, '').trim();
    } else if (tipFound && trimmedLine.length > 0) {
      // Collect additional tip lines for multi-line tips
      tipLines.push(trimmedLine);
    }
  }

  // Combine tip lines if we collected additional content
  if (tipLines.length > 0) {
    nutritionData.tip += ' ' + tipLines.join(' ');
  }

  return nutritionData;
}

/**
 * Extracts numeric values from nutrition strings (e.g., "32g" -> 32)
 * @param str - String containing numeric value
 * @returns Extracted number or 0 if not found
 */
function extractNumericValue(str: string): number {
  const match = str.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// ============================================================================
// CHART COMPONENTS
// ============================================================================

/**
 * Pie chart component for visualizing macronutrient breakdown
 * @param nutritionData - Parsed nutrition data
 */
function NutritionPieChart({ nutritionData }: { nutritionData: NutritionData }) {
  // Extract numeric values for chart data
  const proteinValue = extractNumericValue(nutritionData.protein);
  const carbsValue = extractNumericValue(nutritionData.carbs);
  const fatValue = extractNumericValue(nutritionData.fat);

  // Debug logging for development
  console.log('Nutrition data for chart:', {
    protein: nutritionData.protein,
    carbs: nutritionData.carbs,
    fat: nutritionData.fat,
    tip: nutritionData.tip,
    proteinValue,
    carbsValue,
    fatValue
  });

  // Show fallback if no valid macro data
  if (proteinValue === 0 && carbsValue === 0 && fatValue === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-500">
        <p>No macro data available for chart</p>
      </div>
    );
  }

  // Chart.js data configuration
  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [proteinValue, carbsValue, fatValue],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue for protein
          'rgba(34, 197, 94, 0.8)',  // Green for carbs
          'rgba(234, 179, 8, 0.8)',  // Yellow for fat
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart.js options configuration
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}g`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Pie data={data} options={options} />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Main application component for meal nutrition analysis
 * Features:
 * - Image upload and AI analysis
 * - Camera capture functionality
 * - Barcode lookup for packaged foods
 * - Meal tracking and daily totals
 * - Nutrition visualization with charts
 * - AI-powered nutrition tips
 */
export default function Home() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  // Image upload and analysis states
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Barcode lookup states
  const [barcode, setBarcode] = useState('');
  //const [barcodeData, setBarcodeData] = useState<any>(null);
  const [barcodeData, setBarcodeData] = useState(null);
  const [barcodeError, setBarcodeError] = useState('');

  // Meal tracking states
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([]);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * Handles image upload and sends to analysis API
   * @param e - File input change event
   */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL and show loading state
    setImage(URL.createObjectURL(file));
    setIsLoading(true);

    // Prepare form data for API request
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send image to analysis API
      const res = await fetch('/api/analyse', {
        method: 'POST',
        body: formData,
      });
    
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
    
      setResult(data.result);
    } catch (err: any) {
      console.error('Upload failed:', err.message);
      setResult(`⚠️ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Resets the application state for a new upload
   */
  function handleNewUpload() {
    setImage(null);
    setResult(null);
    // Reset the file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  /**
   * Handles barcode lookup using OpenFoodFacts API
   */
  async function handleBarcodeSearch() {
    try {
      setBarcodeError('');
      setBarcodeData(null);
      
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      
      if (data.status !== 1) throw new Error('Product not found');
      setBarcodeData(data.product);
    } catch (err: any) {
      setBarcodeError(err.message);
    }
  }

  /**
   * Saves the current AI analysis as a meal entry
   */
  function saveMealFromAnalysis() {
    if (!result) return;
    
    const nutritionData = parseNutritionResult(result);
    const meal: MealEntry = {
      id: Date.now(),
      name: "AI Analyzed Meal",
      calories: extractNumericValue(nutritionData.calories),
      protein: extractNumericValue(nutritionData.protein),
      carbs: extractNumericValue(nutritionData.carbs),
      fat: extractNumericValue(nutritionData.fat),
      timestamp: new Date(),
    };
    
    setTodaysMeals(prev => [...prev, meal]);
    console.log('Meal saved:', meal); // Debug log
  }

  /**
   * Opens camera interface
   */
  async function openCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      setShowCamera(true);
      setCameraError('');
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError('Camera access needed to take photos');
    }
  }

  /**
   * Captures photo from camera
   */
  function capturePhoto() {
    if (!stream) return;
    
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // Convert to blob and process like uploaded file
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      
      // Set image preview
      setImage(URL.createObjectURL(file));
      closeCamera();
      
      // Process the photo
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/analyse', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unknown error');
        setResult(data.result);
      } catch (err: any) {
        console.error('Analysis failed:', err.message);
        setResult(`⚠️ Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }, 'image/jpeg', 0.8);
  }

  /**
   * Closes camera and stops stream
   */
  function closeCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Parse nutrition data from API result
  const nutritionData = result ? parseNutritionResult(result) : null;

  // Debug logging for development
  if (nutritionData) {
    console.log('Parsed nutrition data:', nutritionData);
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* ====================================================================
            HEADER SECTION
        ==================================================================== */}
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🍽️ Meal Nutrition Analyzer
        </h1>
        
        {/* ====================================================================
            TODAY'S MEALS SECTION
        ==================================================================== */}
        {todaysMeals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📊 Today&apos;s Meals ({todaysMeals.length})
            </h2>
            
            {/* Daily Totals */}
            <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {todaysMeals.reduce((sum, meal) => sum + meal.calories, 0)}
                </div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {todaysMeals.reduce((sum, meal) => sum + meal.protein, 0)}g
                </div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {todaysMeals.reduce((sum, meal) => sum + meal.carbs, 0)}g
                </div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {todaysMeals.reduce((sum, meal) => sum + meal.fat, 0)}g
                </div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-3">
              {todaysMeals.map((meal) => (
                <div key={meal.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                  <div>
                    <div className="font-medium">{meal.name}</div>
                    <div className="text-sm text-gray-500">
                      {meal.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{meal.calories} cal</div>
                    <div className="text-xs text-gray-500">
                      P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            UPLOAD & INPUT SECTION
        ==================================================================== */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          
          {/* Image Upload Area */}
          <div className="text-center mb-6">
            {!showCamera ? (
              <div className="space-y-4">
                {/* Camera Button */}
                <button
                  onClick={openCamera}
                  className="w-full border-2 border-dashed border-blue-400 rounded-lg p-8 hover:border-blue-600 transition-colors bg-blue-50 hover:bg-blue-100"
                >
                  <div className="text-blue-600">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-lg font-semibold">📸 Take Photo</p>
                    <p className="text-sm mt-2">Snap your meal with camera</p>
                  </div>
                </button>
                
                {/* Upload Button */}
                <label htmlFor="file-input" className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm">Or upload from gallery</p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              /* Camera Interface */
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    id="camera-video"
                    ref={(video) => {
                      if (video && stream) {
                        video.srcObject = stream;
                        video.play();
                      }
                    }}
                    className="w-full h-64 object-cover"
                    autoPlay
                    playsInline
                  />
                </div>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={capturePhoto}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    📸 Capture
                  </button>
                  <button
                    onClick={closeCamera}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <input 
              id="file-input"
              type="file" 
              accept="image/*" 
              onChange={handleUpload} 
              className="hidden" 
            />
          </div>

          {/* Camera Error Display */}
          {cameraError && (
            <div className="text-center mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {cameraError}
            </div>
          )}

          {/* Barcode Lookup Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">📦 Enter Barcode</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 737628064502"
                className="flex-1 border p-2 rounded"
                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
              />
              <button
                onClick={handleBarcodeSearch}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Barcode Error Display */}
            {barcodeError && (
              <p className="text-red-600 mt-2">{barcodeError}</p>
            )}

            {/* Barcode Results Display */}
            {barcodeData && (
              <div className="mt-4 p-4 bg-gray-100 rounded shadow space-y-1">
                <div><strong>{barcodeData.product_name}</strong></div>
                <div>Calories/100g: {barcodeData.nutriments['energy-kcal_100g'] ?? 'N/A'} kcal</div>
                <div>Fat: {barcodeData.nutriments['fat_100g'] ?? 'N/A'} g</div>
                <div>Sugars: {barcodeData.nutriments['sugars_100g'] ?? 'N/A'} g</div>
                <div>Protein: {barcodeData.nutriments['proteins_100g'] ?? 'N/A'} g</div>
              </div>
            )}
          </div>

          {/* Image Preview */}
          {image && (
            <div className="text-center mb-6">
              <img src={image} alt="Meal preview" className="max-w-md mx-auto rounded-lg shadow-lg" />
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Analyzing your meal...</span>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            NUTRITION ANALYSIS RESULTS SECTION
        ==================================================================== */}
        {nutritionData && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              📊 Nutrition Analysis
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              
              {/* Nutrition Facts Panel */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Nutrition Facts</h3>
                
                <div className="space-y-4">
                  {/* Calories */}
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🔥</span>
                      <span className="font-medium text-gray-700">Calories</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{nutritionData.calories}</span>
                  </div>
                  
                  {/* Protein */}
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💪</span>
                      <span className="font-medium text-gray-700">Protein</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{nutritionData.protein}</span>
                  </div>
                  
                  {/* Carbs */}
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🌾</span>
                      <span className="font-medium text-gray-700">Carbs</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{nutritionData.carbs}</span>
                  </div>
                  
                  {/* Fat */}
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🥑</span>
                      <span className="font-medium text-gray-700">Fat</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{nutritionData.fat}</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart Panel */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Macro Breakdown</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <NutritionPieChart nutritionData={nutritionData} />
                </div>
              </div>

              {/* AI Tip Panel */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">🤖 AI Nutrition Tip</h3>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">💡</span>
                    <p className="text-gray-700 leading-relaxed">{nutritionData.tip}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center pt-8 border-t border-gray-200 space-x-4">
              <button
                onClick={saveMealFromAnalysis}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                ✅ Save to Today
              </button>
              <button
                onClick={handleNewUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                📸 Upload New Image
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
