import { NextResponse } from 'next/server';
import { defaultSiteData } from '@/lib/siteData';
import { createFile, getFile, hasGitHubConfig, SITE_CONTENT_PATH, updateFile } from '@/lib/github';
import { normalizeSiteData, serializeSiteData } from '@/lib/siteContent';
import { requireAdminAuth } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    if (!requireAdminAuth(req)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!hasGitHubConfig()) {
      return NextResponse.json({ content: defaultSiteData, sha: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const fileData = await getFile(SITE_CONTENT_PATH);
    const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

    return NextResponse.json({ content: normalizeSiteData(content), sha: fileData.sha }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to read admin site content:', error);
    return NextResponse.json({ content: defaultSiteData, sha: null }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function PUT(req: Request) {
  try {
    if (!requireAdminAuth(req)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!hasGitHubConfig()) {
      return NextResponse.json({ message: 'GitHub sync is not configured. Set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN.' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    if (!body || typeof body !== 'object' || !('content' in body)) {
      return NextResponse.json({ message: 'Content is required.' }, { status: 400 });
    }

    const content = normalizeSiteData(body.content);
    const sha = typeof body.sha === 'string' ? body.sha.trim() : '';

    const commitMessage = typeof body.message === 'string' && body.message.trim()
      ? body.message.trim()
      : `[Admin] Update site content - ${new Date().toISOString()}`;

    const fileContent = serializeSiteData(content);
    let result;

    if (sha) {
      result = await updateFile(SITE_CONTENT_PATH, fileContent, commitMessage, sha);
    } else {
      try {
        const existingFile = await getFile(SITE_CONTENT_PATH);
        result = await updateFile(SITE_CONTENT_PATH, fileContent, commitMessage, existingFile.sha);
      } catch {
        result = await createFile(SITE_CONTENT_PATH, fileContent, commitMessage);
      }
    }

    return NextResponse.json({
      ok: true,
      sha: result.content?.sha ?? null,
      commit: result.commit?.sha ?? null,
    });
  } catch (error) {
    console.error('Failed to save admin site content:', error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Server error while saving site content.' }, { status: 500 });
  }
}