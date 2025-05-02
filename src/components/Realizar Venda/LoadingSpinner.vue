<template>
    <div class="spinner-container">
      <div class="spinner"></div>
      <h2>Carregando...</h2>
    </div>
  </template>
  
  <style scoped>
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 15vh;
  }
  
  .spinner {
    width: 40vh;
    height: 40vh;
    border: 25px solid rgba(0, 0, 0, 0.4);
    border-left-color: #2ecc71; /* Cor do loader */
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10vh;

  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  