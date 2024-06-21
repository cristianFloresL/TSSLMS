import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './LCGCompo.css';
import Modal from './modal';

function rejectionSampling(mean, stdDev) {
  const proposal = () => Math.random(); // Uniform distribution
  const target = (x) => (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));

  return function() {
    let U, Y;
    do {
      Y = proposal();
      U = Math.random();
    } while (U >= target(Y));
    return Y;
  };
}

function RejectionSamplingComponent() {
  const [mean, setMean] = useState(0);
  const [stdDev, setStdDev] = useState(1);
  const [numbers, setNumbers] = useState([]);
  const [generator, setGenerator] = useState(() => rejectionSampling(mean, stdDev));
  const [form, setForm] = useState(`Target: N(${mean}, ${stdDev}), Proposal: U(0, 1)`);
  const [cod, setCod] = useState(`
    // Código Java para el Método del Rechazo
    import java.util.ArrayList;
    import java.util.List;
    import java.util.Random;

    class Rextester {  
        private double mean;
        private double stdDev;

        public Rextester(double mean, double stdDev) {
            this.mean = mean;
            this.stdDev = stdDev;
        }

        private double target(double x) {
            return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
        }

        public List<Double> generate(int count) {
            List<Double> randomNumbers = new ArrayList<>();
            Random rand = new Random();

            for (int i = 0; i < count; i++) {
                double Y, U;
                do {
                    Y = rand.nextDouble(); // Proposal: Uniform(0, 1)
                    U = rand.nextDouble();
                } while (U >= target(Y));
                randomNumbers.add(Y);
            }

            return randomNumbers;
        }

        public static void main(String[] args) {
            double mean = ${mean}; // Media de la distribución
            double stdDev = ${stdDev}; // Desviación estándar de la distribución

            Rextester rejectionSampling = new Rextester(mean, stdDev);
            List<Double> randomNumbers = rejectionSampling.generate(1000); // Genera 1000 números aleatorios

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
    if (stdDev == null || stdDev <= 0) { setStdDev(1); }
    setGenerator(() => rejectionSampling(mean, stdDev));
    setForm(`Target: N(${mean}, ${stdDev}), Proposal: U(0, 1)`);
    setCod(`
    // Código Java para el Método del Rechazo
    import java.util.ArrayList;
    import java.util.List;
    import java.util.Random;

    class Rextester {  
        private double mean;
        private double stdDev;

        public Rextester(double mean, double stdDev) {
            this.mean = mean;
            this.stdDev = stdDev;
        }

        private double target(double x) {
            return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
        }

        public List<Double> generate(int count) {
            List<Double> randomNumbers = new ArrayList<>();
            Random rand = new Random();

            for (int i = 0; i < count; i++) {
                double Y, U;
                do {
                    Y = rand.nextDouble(); // Proposal: Uniform(0, 1)
                    U = rand.nextDouble();
                } while (U >= target(Y));
                randomNumbers.add(Y);
            }

            return randomNumbers;
        }

        public static void main(String[] args) {
            double mean = ${mean}; // Media de la distribución
            double stdDev = ${stdDev}; // Desviación estándar de la distribución

            Rextester rejectionSampling = new Rextester(mean, stdDev);
            List<Double> randomNumbers = rejectionSampling.generate(1000); // Genera 1000 números aleatorios

            // Imprime los números aleatorios generados
            System.out.println("Lista de números aleatorios generados:");
            for (double number : randomNumbers) {
                System.out.println(number);
            }
        }
    }
    `);
  }, [mean, stdDev]);

  const handleGenerate = () => {
    const newNumbers = [];
    const generate = rejectionSampling(mean, stdDev);
    for (let i = 0; i < 1000; i++) { // Generate 1000 numbers
      newNumbers.push(generate());
    }
    setNumbers(newNumbers.sort((a, b) => a - b));
  };

  const handleReset = () => {
    setGenerator(() => rejectionSampling(mean, stdDev));
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
        <h2>Método del Rechazo</h2>
        <div className="chart-container">
          <h3>Gráfica de Números Generados</h3>
          <Line data={data} options={options} />
        </div>
        <div className="code-section">
          <button onClick={openModal}><h4>Ver Código Java del Método del Rechazo</h4></button>
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <h3>Código Java para el Método del Rechazo:</h3>
            <pre>{cod}</pre>
          </Modal>
        </div>
      </div>
      <div className="right-container">
        <div className="inputs-container">
          <h3>Valores</h3>
          <label>
            Media (µ):
            <input
              type="number"
              value={mean}
              onChange={(e) => setMean(parseFloat(e.target.value))}
              onBlur={handleBlur(setMean)}
              step="0.1"
            />
          </label>
          <br/>
          <label>
            Desviación Estándar (σ):
            <input
              type="number"
              value={stdDev}
              onChange={(e) => setStdDev(parseFloat(e.target.value))}
              onBlur={handleBlur(setStdDev)}
              step="0.1"
              min="0.1"
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

export default RejectionSamplingComponent;
