import {AxisScore} from '../components/ResultView';
import {JOB_CATEGORIES, MBTI_PROFILES, MbtiProfile} from '../data/mbtiData';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = '';

  for (let i = 0; i < chars.length; i += 1) {
    const testLine = current + chars[i];
    if (ctx.measureText(testLine).width > maxWidth && current.length > 0) {
      // Avoid breaking right after a space if there's a recent space
      const lastSpace = current.lastIndexOf(' ');
      if (lastSpace > current.length * 0.55) {
        lines.push(current.slice(0, lastSpace));
        current = current.slice(lastSpace + 1) + chars[i];
      } else {
        lines.push(current);
        current = chars[i];
      }
    } else {
      current = testLine;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = window.setTimeout(() => resolve(null), 2000);
    img.onload = () => {
      window.clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timeout);
      resolve(null);
    };
    img.src = src;
  });
}

export async function exportResultAsPng(
  profile: MbtiProfile,
  axisScores: AxisScore[] | null
): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const width = 1080;
  const height = 1520;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const categoryInfo = JOB_CATEGORIES[profile.category];
  const partner = MBTI_PROFILES[profile.bestMatch.code];
  const top3Jobs = profile.recommendedJobs.slice(0, 3);

  // Outer canvas background
  ctx.fillStyle = '#F4F7FC';
  ctx.fillRect(0, 0, width, height);

  // Main white card
  const pad = 48;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  drawRoundedRect(ctx, pad, pad, cardW, cardH, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#DCE2DF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top dark green banner
  ctx.save();
  drawRoundedRect(ctx, pad, pad, cardW, 112, 28);
  ctx.clip();
  ctx.fillStyle = '#1E40AF';
  ctx.fillRect(pad, pad, cardW, 112);
  // Square off bottom corners of header strip
  ctx.fillRect(pad, pad + 80, cardW, 32);
  ctx.restore();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px "Gowun Batang", "Noto Sans KR", serif';
  ctx.fillText('시니어 일자리 나침반', pad + 44, pad + 64);

  ctx.fillStyle = '#DBEAFE';
  ctx.font = '500 20px "Noto Sans KR", sans-serif';
  const dateLabel = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
  const rightText = `MBTI 성향 결과 · ${dateLabel}`;
  const rightWidth = ctx.measureText(rightText).width;
  ctx.fillText(rightText, pad + cardW - 44 - rightWidth, pad + 62);

  // Profile Header Section
  let cursorY = pad + 168;
  const contentX = pad + 48;
  const contentW = cardW - 96;

  // Optional profile character illustration on top-right
  const img = await loadImage(profile.characterImage);
  const thumbW = 210;
  const thumbH = 210;
  const thumbX = pad + cardW - 48 - thumbW;
  const thumbY = cursorY - 14;

  if (img) {
    ctx.save();
    drawRoundedRect(ctx, thumbX, thumbY, thumbW, thumbH, 18);
    ctx.fillStyle = '#F4F7FC';
    ctx.fill();
    ctx.clip();
    const scale = Math.min(thumbW / img.width, thumbH / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    ctx.drawImage(
      img,
      thumbX + (thumbW - drawW) / 2,
      thumbY + (thumbH - drawH) / 2,
      drawW,
      drawH
    );
    ctx.restore();
    ctx.strokeStyle = '#DCE2EC';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, thumbX, thumbY, thumbW, thumbH, 18);
    ctx.stroke();
  }

  const headerTextMaxW = img ? contentW - thumbW - 32 : contentW;

  ctx.fillStyle = '#1E40AF';
  ctx.font = '600 22px "Noto Sans KR", sans-serif';
  ctx.fillText(
    `${categoryInfo.title} · ${profile.keywords.join(' · ')}`,
    contentX,
    cursorY + 12
  );

  cursorY += 76;
  ctx.fillStyle = '#1E40AF';
  ctx.font = 'bold 64px "Outfit", "Noto Sans KR", sans-serif';
  ctx.fillText(profile.code, contentX, cursorY);

  const codeW = ctx.measureText(profile.code).width;
  ctx.fillStyle = '#141A18';
  ctx.font = 'bold 38px "Gowun Batang", "Noto Sans KR", serif';
  ctx.fillText(profile.archetype, contentX + codeW + 22, cursorY - 6);

  cursorY += 46;
  ctx.fillStyle = '#2A332F';
  ctx.font = '600 23px "Noto Sans KR", sans-serif';
  const subtitleLines = wrapText(ctx, profile.subtitle, headerTextMaxW);
  for (const line of subtitleLines.slice(0, 2)) {
    ctx.fillText(line, contentX, cursorY);
    cursorY += 34;
  }

  cursorY = Math.max(cursorY + 16, thumbY + thumbH + 28);

  // Summary Box
  ctx.fillStyle = '#4A5550';
  ctx.font = '400 21px "Noto Sans KR", sans-serif';
  const summaryLines = wrapText(ctx, profile.summary, contentW);
  for (const line of summaryLines.slice(0, 3)) {
    ctx.fillText(line, contentX, cursorY);
    cursorY += 32;
  }

  // Divider
  cursorY += 16;
  ctx.strokeStyle = '#E3E7E4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, cursorY);
  ctx.lineTo(contentX + contentW, cursorY);
  ctx.stroke();

  // 4-Axis Section if available
  if (axisScores && axisScores.length === 4) {
    cursorY += 40;
    ctx.fillStyle = '#141A18';
    ctx.font = 'bold 24px "Gowun Batang", "Noto Sans KR", serif';
    ctx.fillText('나의 4가지 일터 성향 균형', contentX, cursorY);

    cursorY += 24;
    const colW = (contentW - 28) / 2;
    axisScores.forEach((ax, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const bx = contentX + col * (colW + 28);
      const by = cursorY + row * 82;

      drawRoundedRect(ctx, bx, by, colW, 68, 12);
      ctx.fillStyle = '#F8F9F8';
      ctx.fill();
      ctx.strokeStyle = '#E3E7E4';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#141A18';
      ctx.font = '600 18px "Noto Sans KR", sans-serif';
      ctx.fillText(
        `${ax.leftLabel}(${ax.leftCode}) ${ax.leftPercent}%`,
        bx + 16,
        by + 27
      );

      const rightStr = `${ax.rightPercent}% ${ax.rightLabel}(${ax.rightCode})`;
      const rW = ctx.measureText(rightStr).width;
      ctx.fillText(rightStr, bx + colW - 16 - rW, by + 27);

      // Bar background
      const barX = bx + 16;
      const barY = by + 42;
      const barW = colW - 32;
      drawRoundedRect(ctx, barX, barY, barW, 10, 5);
      ctx.fillStyle = '#DCE2DF';
      ctx.fill();

      // Dominant side highlight
      const leftWins = ax.winner === ax.leftCode;
      if (leftWins) {
        drawRoundedRect(ctx, barX, barY, (barW * ax.leftPercent) / 100, 10, 5);
        ctx.fillStyle = '#1E40AF';
        ctx.fill();
      } else {
        const rightW = (barW * ax.rightPercent) / 100;
        drawRoundedRect(ctx, barX + barW - rightW, barY, rightW, 10, 5);
        ctx.fillStyle = '#1E40AF';
        ctx.fill();
      }
    });

    cursorY += 186;
  } else {
    cursorY += 36;
  }

  // Top 3 Recommended Jobs
  ctx.fillStyle = '#1E40AF';
  ctx.font = '600 19px "Noto Sans KR", sans-serif';
  ctx.fillText('추천 시니어 일자리 TOP 3', contentX, cursorY);

  cursorY += 36;
  ctx.fillStyle = '#141A18';
  ctx.font = 'bold 28px "Gowun Batang", "Noto Sans KR", serif';
  ctx.fillText(`${profile.code} 성향에 꼭 맞는 추천 직무`, contentX, cursorY);

  cursorY += 24;
  top3Jobs.forEach((job, idx) => {
    const boxH = 148;
    drawRoundedRect(ctx, contentX, cursorY, contentW, boxH, 16);
    ctx.fillStyle = '#FAFBFB';
    ctx.fill();
    ctx.strokeStyle = '#DCE2DF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#1E40AF';
    ctx.font = 'bold 20px "Outfit", "Noto Sans KR", sans-serif';
    ctx.fillText(`0${idx + 1}`, contentX + 24, cursorY + 42);

    ctx.fillStyle = '#141A18';
    ctx.font = 'bold 23px "Noto Sans KR", sans-serif';
    ctx.fillText(job.title, contentX + 66, cursorY + 42);

    ctx.fillStyle = '#58635E';
    ctx.font = '500 17px "Noto Sans KR", sans-serif';
    const meta = `${job.programType} · ${job.schedule}`;
    const metaW = ctx.measureText(meta).width;
    ctx.fillText(meta, contentX + contentW - 24 - metaW, cursorY + 41);

    ctx.fillStyle = '#4A5550';
    ctx.font = '400 18px "Noto Sans KR", sans-serif';
    const reasonLines = wrapText(ctx, job.reason, contentW - 48);
    let rY = cursorY + 78;
    for (const line of reasonLines.slice(0, 2)) {
      ctx.fillText(line, contentX + 24, rY);
      rY += 27;
    }

    ctx.fillStyle = '#1E40AF';
    ctx.font = '500 16px "Noto Sans KR", sans-serif';
    ctx.fillText(`신청처: ${job.howToStart}`, contentX + 24, cursorY + 130);

    cursorY += boxH + 16;
  });

  // Footer partner strip
  const footerY = pad + cardH - 118;
  drawRoundedRect(ctx, contentX, footerY, contentW, 52, 12);
  ctx.fillStyle = '#EFF4FF';
  ctx.fill();

  ctx.fillStyle = '#1E40AF';
  ctx.font = '600 18px "Noto Sans KR", sans-serif';
  ctx.fillText(
    `함께 일하기 좋은 동료 유형: ${profile.bestMatch.code} (${partner?.archetype ?? ''})`,
    contentX + 22,
    footerY + 33
  );

  // CI Logo at bottom of white card
  const ciImg = await loadImage('/assets/aistudio/image_81928053.png');
  if (ciImg) {
    const targetH = 38;
    const targetW = (ciImg.width / ciImg.height) * targetH;
    ctx.drawImage(
      ciImg,
      contentX + contentW - targetW,
      pad + cardH - 52,
      targetW,
      targetH
    );
  }

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `천안시니어클럽_일자리MBTI_${profile.code}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
