import React, { useState } from 'react';
import loadingImage from './loading.gif';

function ProvarCodigo() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0'
      }}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#282828',
            zIndex: 1
          }}
        >
          <img src={loadingImage} alt="Cargando..." className="loading-image" />
          <p style={{ marginTop: '20px', fontSize: '18px', color: '#fff' }}>
            Cargando...
          </p>
        </div>
      )}

      <iframe
        src="https://rextester.com/theme"
        title="RexTester"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        onLoad={() => {
          setIsLoading(false);
          alert("Antes de salir, asegúrate de copiar y guardar tu código en tus dispositivos locales, ya que no podrá ser guardado en esta página web.");
        }}
      />
    </div>
  );
}

export default ProvarCodigo;