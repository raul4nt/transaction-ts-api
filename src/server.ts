import { app } from './app'
import { env } from './env'

// app
//   .listen({
//     port: env.PORT,
//   })
//   .then(() => {
//     console.log('HTTP Server Running')
//   })

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',  // Adicione o host aqui
  })
  .then(() => {
    console.log(`HTTP Server Running on port ${env.PORT}`);
  });
