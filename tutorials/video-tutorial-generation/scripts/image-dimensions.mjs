import { readFile } from 'node:fs/promises';
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
export async function pngDimensions(path) {
  const data = await readFile(path);
  if (data.length < 24 || !data.subarray(0, 8).equals(signature) || data.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('Expected a PNG window capture with an IHDR header');
  }
  const width = data.readUInt32BE(16), height = data.readUInt32BE(20);
  if (!width || !height) throw new Error('PNG dimensions must be positive');
  return { width, height };
}
