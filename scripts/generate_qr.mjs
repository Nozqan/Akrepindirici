#!/usr/bin/env node
import QRCode from "qrcode";

const url = process.argv[2];

if (!url) {
  console.error('Usage: node scripts/generate_qr.mjs "exps://..."');
  process.exit(1);
}

