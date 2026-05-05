import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'demo-video.mp4');
  
  try {
    const stat = fs.statSync(filePath);
    const file = fs.createReadStream(filePath);
    
    // Create a readable stream from the file stream
    const stream = new ReadableStream({
      start(controller) {
        file.on('data', (chunk) => controller.enqueue(chunk));
        file.on('end', () => controller.close());
        file.on('error', (err) => controller.error(err));
      },
      cancel() {
        file.destroy();
      }
    });
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (err) {
    console.error('Error serving video:', err);
    return new NextResponse('Video not found', { status: 404 });
  }
}
