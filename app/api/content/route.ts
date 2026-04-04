import { NextResponse } from 'next/server';
import { defaultSiteData } from '@/lib/siteData';
import { getFile, hasGitHubConfig, SITE_CONTENT_PATH } from '@/lib/github';
import { normalizeSiteData } from '@/lib/siteContent';

export async function GET() {
  try {
    if (!hasGitHubConfig()) {
      return NextResponse.json(defaultSiteData, { headers: { 'Cache-Control': 'no-store' } });
    }

    const fileData = await getFile(SITE_CONTENT_PATH);
    const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

    return NextResponse.json(normalizeSiteData(content), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to fetch site content:', error);
    return NextResponse.json(defaultSiteData, { headers: { 'Cache-Control': 'no-store' } });
  }
}