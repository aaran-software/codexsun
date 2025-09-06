import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Chart as ChartJS, ScatterController, LineController, PointElement, LineElement, LinearScale, Title, Tooltip } from 'chart.js';
import axios from 'axios';

ChartJS.register(ScatterController, LineController, PointElement, LineElement, LinearScale, Title, Tooltip);

interface DataPoint {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [xInput, setXInput] = useState<string>('');
  const [yInput, setYInput] = useState<string>('');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [regressionLine, setRegressionLine] = useState<DataPoint[]>([]);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [epochs, setEpochs] = useState<number>(100);
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchDataPoints = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/ai/data');
        if (response.data.success) {
          setDataPoints(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch data points.');
        console.error(err);
      }
    };
    fetchDataPoints();
  }, []);

  const addDataPoint = async () => {
    const x = parseFloat(xInput);
    const y = parseFloat(yInput);
    if (!isNaN(x) && !isNaN(y)) {
      try {
        const response = await axios.post('http://localhost:3000/api/ai/data', { x, y });
        if (response.data.success) {
          setDataPoints([...dataPoints, { x, y }]);
          setXInput('');
          setYInput('');
          setError(null);
        }
      } catch (err) {
        setError('Failed to save data point.');
        console.error(err);
      }
    } else {
      setError('Please enter valid numbers for X and Y.');
    }
  };

  const clearDataPoints = async () => {
    try {
      const response = await axios.delete('http://localhost:3000/api/ai/data');
      if (response.data.success) {
        setDataPoints([]);
        setRegressionLine([]);
        setPrediction(null);
        setError(null);
      }
    } catch (err) {
      setError('Failed to clear data points.');
      console.error(err);
    }
  };

  const trainModel = async () => {
    if (dataPoints.length < 2) {
      setError('Please add at least 2 data points to train the model.');
      return;
    }

    setIsTraining(true);
    setError(null);

    try {
      const xs = tf.tensor2d(dataPoints.map((p) => [p.x]), [dataPoints.length, 1]);
      const ys = tf.tensor2d(dataPoints.map((p) => [p.y]), [dataPoints.length, 1]);

      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
      model.compile({
        optimizer: tf.train.sgd(learningRate),
        loss: 'meanSquaredError',
      });

      await model.fit(xs, ys, { epochs, verbose: 0 });

      const xMin = Math.min(...dataPoints.map((p) => p.x));
      const xMax = Math.max(...dataPoints.map((p) => p.x));
      const xRange = tf.tensor2d([[xMin], [xMax]], [2, 1]);
      const yPred = model.predict(xRange) as tf.Tensor;
      const yPredArray = yPred.dataSync();
      setRegressionLine([
        { x: xMin, y: yPredArray[0] },
        { x: xMax, y: yPredArray[1] },
      ]);

      const sampleX = tf.tensor2d([[dataPoints[dataPoints.length - 1].x]], [1, 1]);
      const pred = (model.predict(sampleX) as tf.Tensor).dataSync()[0];
      setPrediction(pred);

      xs.dispose();
      ys.dispose();
      xRange.dispose();
      yPred.dispose();
      sampleX.dispose();
    } catch (err) {
      setError('Failed to train model. Please try again.');
      console.error(err);
    } finally {
      setIsTraining(false);
    }
  };

  useEffect(() => {
    if (chartRef.current && dataPoints.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        new ChartJS(ctx, {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: 'Data Points',
                data: dataPoints,
                backgroundColor: '#8884d8',
                pointRadius: 5,
              },
              {
                type: 'line',
                label: 'Regression Line',
                data: regressionLine,
                borderColor: '#ff7300',
                fill: false,
                pointRadius: 0,
              },
            ],
          },
          options: {
            scales: {
              x: { type: 'linear', position: 'bottom', title: { display: true, text: 'X' } },
              y: { title: { display: true, text: 'Y' } },
            },
            plugins: {
              tooltip: { enabled: true },
              title: { display: true, text: 'ML Data Points and Regression Line' },
            },
          },
        });
      }
    }
  }, [dataPoints, regressionLine]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Simple ML App</h1>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">X Value:</label>
          <input
            type="number"
            value={xInput}
            onChange={(e) => setXInput(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter X value"
            disabled={isTraining}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Y Value:</label>
          <input
            type="number"
            value={yInput}
            onChange={(e) => setYInput(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter Y value"
            disabled={isTraining}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Epochs:</label>
          <input
            type="number"
            value={epochs}
            onChange={(e) => setEpochs(parseInt(e.target.value) || 100)}
            className="w-full p-2 border rounded"
            placeholder="Enter number of epochs"
            disabled={isTraining}
            min="1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Learning Rate:</label>
          <input
            type="number"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.01)}
            className="w-full p-2 border rounded"
            placeholder="Enter learning rate"
            disabled={isTraining}
            step="0.001"
            min="0.001"
            max="1"
          />
        </div>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={addDataPoint}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isTraining}
          >
            Add Data Point
          </button>
          <button
            onClick={trainModel}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-green-300"
            disabled={isTraining}
          >
            {isTraining ? 'Training...' : 'Train Model'}
          </button>
          <button
            onClick={clearDataPoints}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:bg-red-300"
            disabled={isTraining}
          >
            Clear Data
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {dataPoints.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Data Points:</h2>
            <ul>
              {dataPoints.map((point, index) => (
                <li key={index} className="text-gray-700">
                  X: {point.x}, Y: {point.y}
                </li>
              ))}
            </ul>
          </div>
        )}
        {prediction !== null && (
          <p className="text-gray-700 mb-4">
            Predicted Y for X={dataPoints[dataPoints.length - 1].x}: {prediction.toFixed(2)}
          </p>
        )}
        {dataPoints.length > 0 && (
          <canvas ref={chartRef} width={400} height={300}></canvas>
        )}
      </div>
    </div>
  );
};

export default App;