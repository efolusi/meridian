#!/usr/bin/env node
import { main } from '../src/cli.mjs';

// `meridian list | head` closes the pipe early; that is not an error.
process.stdout.on('error', error => {
  if (error.code === 'EPIPE') process.exit(0);
  throw error;
});

main(process.argv.slice(2)).then(code => {
  process.exitCode = code;
}, error => {
  process.stderr.write(`meridian: ${error.message}\n`);
  process.exitCode = 4;
});
