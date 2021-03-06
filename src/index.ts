import { setupServer, setupDatabase } from './setup';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  await setupDatabase();
  try {
    await setupServer(4000);
    console.log('Server is ready at http://localhost:4000/graphql');
  } catch (err) {
    console.error('Error starting the node server', err);
  }
}

main();
