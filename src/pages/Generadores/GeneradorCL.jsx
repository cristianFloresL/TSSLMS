import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Esto importa automáticamente todos los elementos de Chart.js
import './LCGCompo.css';
import Modal from './modal';
function LCG(seed, a, c, m) {
  let X = seed;
  return function () {
    X = (a * X + c) % m;
    return X;
  };
}

function LCGComponent() {
  const [seed, setSeed] = useState(1);
  const [a, setA] = useState(6);
  const [c, setC] = useState(9);
  const [m, setM] = useState(13);
  const [numbers, setNumbers] = useState([]);
  const [generator, setGenerator] = useState(() => LCG(seed, a, c, m));
  const [form, setForm] = useState(`Xn+1 = (${a} * Xn + ${c}) % ${m} ; Xn: ${seed}`);
  const [cod, setCod] = useState(`
import java.util.ArrayList;
import java.util.List;

class Rextester {  
    private long a;
    private long c;
    private long m;
    private long seed;

    public Rextester(long seed, long a, long c, long m) {
        this.seed = seed;
        this.a = a;
        this.c = c;
        this.m = m;
    }

    public List<Long> generate(int count) {
        List<Long> randomNumbers = new ArrayList<>();
        long current = seed;

        for (int i = 0; i < count; i++) {
            current = (a * current + c) % m;
            randomNumbers.add(current);
        }

        return randomNumbers;
    }

    public static void main(String[] args) {
        long seed = ${seed}; // Semilla inicial
        long a = ${a}; // Multiplicador
        long c = ${c}; // Incremento
        long m = ${m}; // Módulo 

        Rextester lcg = new Rextester(seed, a, c, m);
        List<Long> randomNumbers = lcg.generate((int) m); // Genera m números aleatorios

        // Imprime los números aleatorios generados
        System.out.println("Lista de números aleatorios generados:");
        for (long number : randomNumbers) {
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
    if (a == null || a < 0) { setA(0); }
    if (c == null || c < 0) { setC(0); }
    if (m == null || m < 0) { setM(0); }
    if (seed == null || seed < 0) { setSeed(0); }
    setGenerator(() => LCG(seed, a, c, m));
    setForm(`Xn+1 = (${a} * Xn + ${c}) % ${m} ; Xn: ${seed}`);
    setCod(`
import java.util.ArrayList;
import java.util.List;

class Rextester {  
    private long a;
    private long c;
    private long m;
    private long seed;

    public Rextester(long seed, long a, long c, long m) {
        this.seed = seed;
        this.a = a;
        this.c = c;
        this.m = m;
    }

    public List<Long> generate(int count) {
        List<Long> randomNumbers = new ArrayList<>();
        long current = seed;

        for (int i = 0; i < count; i++) {
            current = (a * current + c) % m;
            randomNumbers.add(current);
        }

        return randomNumbers;
    }

    public static void main(String[] args) {
        long seed = ${seed}; // Semilla inicial
        long a = ${a}; // Multiplicador
        long c = ${c}; // Incremento
        long m = ${m}; // Módulo 

        Rextester lcg = new Rextester(seed, a, c, m);
        List<Long> randomNumbers = lcg.generate((int) m); // Genera m números aleatorios

        // Imprime los números aleatorios generados
        System.out.println("Lista de números aleatorios generados:");
        for (long number : randomNumbers) {
            System.out.println(number);
        }
    }
}`);
  }, [seed, a, c, m]);

  const handleGenerate = () => {
    const newNumbers = [];
    const generate = LCG(seed, a, c, m);
    for (let i = 0; i < m; i++) {
      newNumbers.push(generate());
    }
    setNumbers(newNumbers);
  };

  const handleReset = () => {
    setGenerator(() => LCG(seed, a, c, m));
    setNumbers([]);
  };

  const handleBlur = (setter) => (e) => {
    const value = e.target.value;
    setter(value === '' ? 0 : parseInt(value, 10));
  };

  // Configuración de los datos para la gráfica
  const data = {
    labels: numbers.map((_, index) => index + 1), // Crear etiquetas para cada número generado
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
        <div className="chart-container">
          <h3>Gráfica de Números Generados</h3>
          <Line data={data} options={options} />
        </div>
        <div className="code-section">
        <button onClick={openModal}> <h4>Ver Codigo Java de Generador Congruencial Lineal</h4></button>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
      <h3>Código Java para Generador Congruencial Lineal:</h3>
        <pre>{cod}</pre>
      </Modal>
          
          
        </div>
      </div>
      <div className="right-container" >
        <div className="inputs-container">
        <h3>Valores</h3>
          <label>
            Semilla:
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value, 10))}
              onBlur={handleBlur(setSeed)}
            />
            <br/>
          </label>
          <label>
            Multiplicador (a):
            <input
              type="number"
              value={a}
              onChange={(e) => setA(parseInt(e.target.value, 10))}
              onBlur={handleBlur(setA)}
            />
          </label>
          <br/>
          <label>
            Incremento (c):
            <input
              type="number"
              value={c}
              onChange={(e) => setC(parseInt(e.target.value, 10))}
              onBlur={handleBlur(setC)}
            />
            <br/>
          </label>
          <label>
            Módulo (m):
            <input
              type="number"
              value={m}
              onChange={(e) => setM(parseInt(e.target.value, 10))}
              onBlur={handleBlur(setM)}
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

export default LCGComponent;
