import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './LCGCompo.css';
import Modal from './modal';

function inverseTransformSampling(lambda) {
  return function() {
    let U;
    do {
      U = Math.random();
    } while (U === 0); // Avoid U being 0 to prevent ln(0)
    return -Math.log(1 - U) / lambda;
  };
}

function InverseTransformComponent() {
  const [lambda, setLambda] = useState(5);
  const [numbers, setNumbers] = useState([]);
  const [generator, setGenerator] = useState(() => inverseTransformSampling(lambda));
  const [form, setForm] = useState(`X = -ln(1 - U) / ${lambda}`);
  const [cod, setCod] = useState(`
// Código Java para Transformada Inversa
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

class Rextester {  
    private double lambda;

    public Rextester(double lambda) {
        this.lambda = lambda;
    }

    public List<Double> generate(int count) {
        List<Double> randomNumbers = new ArrayList<>();
        Random rand = new Random();

        for (int i = 0; i < count; i++) {
            double U = rand.nextDouble();
            double X = -Math.log(1 - U) / lambda;
            randomNumbers.add(X);
        }

        return randomNumbers;
    }

    public static void main(String[] args) {
        double lambda = ${lambda}; // Parámetro de la distribución

        Rextester inverseTransform = new Rextester(lambda);
        List<Double> randomNumbers = inverseTransform.generate(1000); // Genera 1000 números aleatorios

        // Imprime los números aleatorios generados
        System.out.println("Lista de números aleatorios generados:");
        for (double number : randomNumbers) {
            System.out.println(number);
        }
    }
}
  `);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNumbersModalOpen, setIsNumbersModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const openNumbersModal = () => {
    setIsNumbersModalOpen(true);
  };

  const closeNumbersModal = () => {
    setIsNumbersModalOpen(false);
  };
  useEffect(() => {
    if (lambda == null || lambda <= 0) { setLambda(1); }
    setGenerator(() => inverseTransformSampling(lambda));
    setForm(`X = -ln(1 - U) / ${lambda}`);
    setCod(`
// Código Java para Transformada Inversa
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

class Rextester {  
    private double lambda;

    public Rextester(double lambda) {
        this.lambda = lambda;
    }

    public List<Double> generate(int count) {
        List<Double> randomNumbers = new ArrayList<>();
        Random rand = new Random();

        for (int i = 0; i < count; i++) {
            double U = rand.nextDouble();
            double X = -Math.log(1 - U) / lambda;
            randomNumbers.add(X);
        }

        return randomNumbers;
    }

    public static void main(String[] args) {
        double lambda = ${lambda}; // Parámetro de la distribución

        Rextester inverseTransform = new Rextester(lambda);
        List<Double> randomNumbers = inverseTransform.generate(1000); // Genera 1000 números aleatorios

        // Imprime los números aleatorios generados
        System.out.println("Lista de números aleatorios generados:");
        for (double number : randomNumbers) {
            System.out.println(number);
        }
    }
}
    `);
  }, [lambda]);

  const handleGenerate = () => {
    const newNumbers = [];
    const generate = inverseTransformSampling(lambda);
    for (let i = 0; i < 1000; i++) { // Generate 100 numbers
      const num = generate();
      if (num >= 0 && num <= 1) {
        newNumbers.push(num);
      }
      else{i--;}
    }
    setNumbers(newNumbers.sort((a, b) => a - b));
  };

  const handleReset = () => {
    setGenerator(() => inverseTransformSampling(lambda));
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
        <h2>Transformada Inversa</h2>
        <div className="chart-container">
          <h3>Gráfica de Números Generados</h3>
          <Line data={data} options={options} />
        </div>
        <div className="code-section">
          <button onClick={openModal}><h4>Ver Código Java de Transformada Inversa</h4></button>
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <h3>Código Java para Transformada Inversa:</h3>
            <pre>{cod}</pre>
          </Modal>
        </div>
      </div>
      <div className="right-container">
        <div className="inputs-container">
          <h3>Valores</h3>
          <label>
            Lambda (λ):
            <input
              type="number"
              value={lambda}
              onChange={(e) => setLambda(parseFloat(e.target.value))}
              onBlur={handleBlur(setLambda)}
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
        <div className="buttons">
        <button onClick={openNumbersModal} disabled={numbers.length === 0}>Mostrar Números Generados</button>
      
        </div>
       
      </div>
      <Modal isOpen={isNumbersModalOpen} onClose={closeNumbersModal}>
        <h3>Números Generados:</h3>
        <ul>
          {numbers.map((number, index) => (
            <li key={index}>{number.toFixed(4)}</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

export default InverseTransformComponent;
