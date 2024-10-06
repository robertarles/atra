import {inspect as _inspect} from 'util';

export function inspect(object:unknown, options?: {colors:boolean, depth:number}):unknown{
  if (!options) {
    options = {colors: true, depth: 2};
  }
  return _inspect(object,options);
}

export function info (message:string):void {
  process.stdout.write(message);
}

export function verbose(message:string):void {
  if (process.env.LOGLEVEL?.toLowerCase() === 'verbose' || process.env.LOGLEVEL?.toLowerCase() === 'debug') {
    process.stdout.write(message);
  }
}

export function debug(message:string):void {
  if (process.env.LOGLEVEL?.toLowerCase() === 'debug'){
    process.stdout.write(message);
  }
}
