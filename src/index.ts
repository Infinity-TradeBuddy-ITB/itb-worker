import cluster from 'cluster';
import os from 'os';

import { log } from './lib/log/log_lib.js';

const numCPUs = os.cpus().length;

// ******************** clusters creation 
async function main() {
  if (numCPUs < 5) {
    log(`we have more workers than cores: ${numCPUs} cores and 5 workers\n\n`)
  }

  if (cluster.isPrimary) {
    for (let i = 0; i < 5; i++) {
      cluster.fork({ clusterIndex: i });
    }

    cluster.on('exit', (worker, code, signal) => {
      log(`worker ${worker.process.pid} died`);
    });

  } else {
    const { clusterBehavior } = await import('./lib/clusters/cluster_behavior.js');
    clusterBehavior(process.env.clusterIndex, process.argv[2] === 'test' ? true : false);
  }
}

main();