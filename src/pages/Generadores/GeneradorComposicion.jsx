import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './LCGCompo.css';
import Modal from './modal';

function compositionSampling(mean1, stdDev1, mean2, stdDev2, weights) {
  const normal1 = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev1 + mean1;
  };
  const normal2 = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev2 + mean2;
  };

  return function() {
    const rand = Math.random();
    if (rand < weights[0]) {
      return normal1();
    } else {
      return normal2();
    }
  };
}

function CompositionSamplingComponent() {
  const [mean1, setMean1] = useState(5);
  const [stdDev1, setStdDev1] = useState(1);
  const [mean2, setMean2] = useState(5);
  const [stdDev2, setStdDev2] = useState(1);
  const [weights, setWeights] = useState([0.5, 0.5]);
  const [numbers, setNumbers] = useState([]);
  const [generator, setGenerator] = useState(() => compositionSampling(mean1, stdDev1, mean2, stdDev2, weights));
  const [form, setForm] = useState(`Target: Mix N(${mean1}, ${stdDev1}), N(${mean2}, ${stdDev2}), Weights: [${weights[0]}, ${weights[1]}]`);
  const [cod, setCod] = useState(`
    // Código Java para el Método de Composición
    import java.util.ArrayList;
    import java.util.List;
    import java.util.Random;

    class Rextester {  
        private double mean1;
        private double stdDev1;
        private double mean2;
        private double stdDev2;
        private double weight1;
        private double weight2;

        public Rextester(double mean1, double stdDev1, double mean2, double stdDev2, double weight1, double weight2) {
            this.mean1 = mean1;
            this.stdDev1 = stdDev1;
            this.mean2 = mean2;
            this.stdDev2 = stdDev2;
            this.weight1 = weight1;
            this.weight2 = weight2;
        }

        private double normal(double mean, double stdDev) {
            Random rand = new Random();
            double u = 0, v = 0;
            while(u == 0) u = rand.nextDouble();
            while(v == 0) v = rand.nextDouble();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
        }

        public List<Double> generate(int count) {
            List<Double> randomNumbers = new ArrayList<>();
            Random rand = new Random();

            for (int i = 0; i < count; i++) {
                double randVal = rand.nextDouble();
                if (randVal < weight1) {
                    randomNumbers.add(normal(mean1, stdDev1));
                } else {
                    randomNumbers.add(normal(mean2, stdDev2));
                }
            }

            return randomNumbers;
        }

        public static void main(String[] args) {
            double mean1 = ${mean1}; // Media de la primera distribución
            double stdDev1 = ${stdDev1}; // Desviación estándar de la primera distribución
            double mean2 = ${mean2}; // Media de la segunda distribución
            double stdDev2 = ${stdDev2}; // Desviación estándar de la segunda distribución
            double weight1 = ${weights[0]}; // Peso de la primera distribución
            double weight2 = ${weights[1]}; // Peso de la segunda distribución

            Rextester compositionSampling = new Rextester(mean1, stdDev1, mean2, stdDev2, weight1, weight2);
            List<Double> randomNumbers = compositionSampling.generate(1000); // Genera 1000 números aleatorios

            // Imprime los números aleatorios generados
            System.out.println("Lista de números aleatorios generados:");
            for (double number : randomNumbers) {
                System.out.println(number);
            }
        }
    }
  `);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (stdDev1 == null || stdDev1 <= 0) { setStdDev1(1); }
    if (stdDev2 == null || stdDev2 <= 0) { setStdDev2(1); }
    if (weights.reduce((a, b) => a + b, 0) !== 1) { setWeights([0.5, 0.5]); }
    setGenerator(() => compositionSampling(mean1, stdDev1, mean2, stdDev2, weights));
    setForm(`Target: Mix N(${mean1}, ${stdDev1}), N(${mean2}, ${stdDev2}), Weights: [${weights[0]}, ${weights[1]}]`);
    setCod(`
    // Código Java para el Método de Composición
    import java.util.ArrayList;
    import java.util.List;
    import java.util.Random;

    class Rextester {  
        private double mean1;
        private double stdDev1;
        private double mean2;
        private double stdDev2;
        private double weight1;
        private double weight2;

        public Rextester(double mean1, double stdDev1, double mean2, double stdDev2, double weight1, double weight2) {
            this.mean1 = mean1;
            this.stdDev1 = stdDev1;
            this.mean2 = mean2;
            this.stdDev2 = stdDev2;
            this.weight1 = weight1;
            this.weight2 = weight2;
        }

        private double normal(double mean, double stdDev) {
            Random rand = new Random();
            double u = 0, v = 0;
            while(u == 0) u = rand.nextDouble();
            while(v == 0) v = rand.nextDouble();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
        }

        public List<Double> generate(int count) {
            List<Double> randomNumbers = new ArrayList<>();
            Random rand = new Random();

            for (int i = 0; i < count; i++) {
                double randVal = rand.nextDouble();
                if (randVal < weight1) {
                    randomNumbers.add(normal(mean1, stdDev1));
                } else {
                    randomNumbers.add(normal(mean2, stdDev2));
                }
            }

            return randomNumbers;
        }

        public static void main(String[] args) {
            double mean1 = ${mean1}; // Media de la primera distribución
            double stdDev1 = ${stdDev1}; // Desviación estándar de la primera distribución
            double mean2 = ${mean2}; // Media de la segunda distribución
            double stdDev2 = ${stdDev2}; // Desviación estándar de la segunda distribución
            double weight1 = ${weights[0]}; // Peso de la primera distribución
            double weight2 = ${weights[1]}; // Peso de la segunda distribución

            Rextester compositionSampling = new Rextester(mean1, stdDev1, mean2, stdDev2, weight1, weight2);
            List<Double> randomNumbers = compositionSampling.generate(1000); // Genera 1000 números aleatorios

            // Imprime los números aleatorios generados
            System.out.println("Lista de números aleatorios generados:");
            for (double number : randomNumbers) {
                System.out.println(number);
            }
        }
    }
    `);
  }, [mean1, stdDev1, mean2, stdDev2, weights]);

  const handleGenerate = () => {
    const newNumbers = [];
    const generate = compositionSampling(mean1, stdDev1, mean2, stdDev2, weights);
    for (let i = 0; i < 1000; i++) { // Generate 1000 numbers
        let j =generate();
        if (j<=1&&j>=0) {
            newNumbers.push(j);
        } else {
            i--;
        }
      
    }
    setNumbers(newNumbers.sort((a, b) => a - b));
  };

  const handleReset = () => {
    setGenerator(() => compositionSampling(mean1, stdDev1, mean2, stdDev2, weights));
    setNumbers([]);
  };

  const handleBlur = (setter) => (e) => {
    const value = e.target.value;
    setter(value === '' ? 1 : parseFloat(value));
  };

  const data = {
    labels: numbers.map((_, index) => index + 1),
    datasets: [
      {
        label: 'Números generados',
        data: numbers,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Índice',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Valor',
        },
      },
    },
  };

  return (
    <div className="lcg-container">
      <div className="left-container">
        <h2>Método de Composición</h2>
        <div className="chart-container">
          <h3>Gráfica de Números Generados</h3>
          <Line data={data} options={options} />
        </div>
        <div className="code-section">
          <button onClick={openModal}><h4>Ver Código Java del Método de Composición</h4></button>
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <h3>Código Java para el Método de Composición:</h3>
            <pre>{cod}</pre>
          </Modal>
        </div>
      </div>
      <div className="right-container">
        <div className="inputs-container">
          <h3>Valores</h3>
          <label>
            Media 1 (µ1):
            <input
              type="number"
              value={mean1}
              onChange={(e) => setMean1(parseFloat(e.target.value))}
              onBlur={handleBlur(setMean1)}
              step="0.1"
            />
          </label>
          <br/>
          <label>
            Desviación Estándar 1 (σ1):
            <input
              type="number"
              value={stdDev1}
              onChange={(e) => setStdDev1(parseFloat(e.target.value))}
              onBlur={handleBlur(setStdDev1)}
              step="0.1"
              min="0.1"
            />
          </label>
          <br/>
          <label>
            Media 2 (µ2):
            <input
              type="number"
              value={mean2}
              onChange={(e) => setMean2(parseFloat(e.target.value))}
              onBlur={handleBlur(setMean2)}
              step="0.1"
            />
          </label>
          <br/>
          <label>
            Desviación Estándar 2 (σ2):
            <input
              type="number"
              value={stdDev2}
              onChange={(e) => setStdDev2(parseFloat(e.target.value))}
              onBlur={handleBlur(setStdDev2)}
              step="0.1"
              min="0.1"
            />
          </label>
          <br/>
          <label>
            Peso 1 (p1):
            <input
              type="number"
              value={weights[0]}
              onChange={(e) => setWeights([parseFloat(e.target.value), weights[1]])}
              onBlur={handleBlur((value) => setWeights([value, weights[1]]))}
              step="0.1"
              min="0.0"
              max="1.0"
              readOnly
            />
          </label>
          <br/>
          <label>
            Peso 2 (p2):
            <input
              type="number"
              value={weights[1]}
              onChange={(e) => setWeights([weights[0], parseFloat(e.target.value)])}
              onBlur={handleBlur((value) => setWeights([weights[0], value]))}
              step="0.1"
              min="0.0"
              max="1.0"
              readOnly
            />
          </label>
        </div>
        <div className="equation">
          <h3>Ecuación:</h3>
          <p>{form}</p>
        </div>
        <div className="buttons">
          <button onClick={handleGenerate}>Generar Números</button>
          <button onClick={handleReset}>Resetear Generador</button>
        </div>
        <h3>Lista Números Aleatorios</h3>
        <ul>
          {numbers.map((number, index) => (
            <li key={index}>{number.toFixed(4)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CompositionSamplingComponent;
