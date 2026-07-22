import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { apiClient } from '../utils/api';

/**
 * ProfileScrapingLoader - AI Depth profile scraping with progressive loading UX
 *
 * Shows animated frames during scrape:
 * - Frame 1 (0-1.5s): "Fetching your profile..."
 * - Frame 2 (1.5-3s): "Analyzing your last 12 posts..."
 * - Frame 3 (3-4.5s): "Understanding your niche..."
 * - Frame 4 (4.5-6s): "You're verified"
 *
 * On completion, shows summary with real data.
 */

const colors = {
  black: '#0F0F0F',
  text2: '#5A5A5A',
  text3: '#A0A0A0',
  green: '#059669',
  border: '#EBEBEB',
  rose: '#E11D48',
};

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const pop = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ProgressRing = styled.div`
  width: 64px;
  height: 64px;
  border: 4px solid ${colors.border};
  border-top-color: ${props => props.$done ? colors.green : colors.black};
  border-radius: 50%;
  animation: ${props => props.$done ? 'none' : 'spin 0.8s linear infinite'};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: ${props => props.$done ? `linear-gradient(135deg, ${colors.green}15, ${colors.green}05)` : '#fff'};
  transition: all 0.3s ease;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const StatusText = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.black};
  margin-bottom: 8px;
  animation: ${pulse} 1.5s ease-in-out infinite;

  ${props => props.$done && `
    animation: none;
    color: ${colors.green};
  `}
`;

const FrameList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  width: 100%;
`;

const FrameItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${props => props.$active ? '#F8F8F8' : 'transparent'};
  border-radius: 10px;
  font-size: 13px;
  color: ${props => props.$done ? colors.green : (props.$active ? colors.black : colors.text3)};
  font-weight: ${props => props.$active || props.$done ? 600 : 400};
  transition: all 0.3s ease;

  ${props => props.$done && css`
    animation: ${pop} 0.3s ease-out;
  `}
`;

const FrameIcon = styled.span`
  font-size: 16px;
  width: 24px;
  display: flex;
  justify-content: center;
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, ${colors.green}08, ${colors.green}02);
  border: 1px solid ${colors.green}30;
  border-radius: 14px;
  padding: 18px;
  margin-top: 20px;
  width: 100%;
  animation: ${fadeIn} 0.4s ease-out;
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: ${colors.green};
`;

const SummaryStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 13px;
  color: ${colors.text2};
  line-height: 1.5;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;

  strong {
    color: ${colors.black};
    font-weight: 600;
  }
`;

const ErrorCard = styled.div`
  background: #FFF1F3;
  border: 1px solid #FECDD3;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  font-size: 13px;
  color: ${colors.rose};
  text-align: center;
`;

const FRAMES = [
  { id: 1, text: 'Fetching your profile...', icon: '🔍' },
  { id: 2, text: 'Analyzing your last 12 posts...', icon: '📸' },
  { id: 3, text: 'Understanding your niche...', icon: '🎯' },
  { id: 4, text: 'You\'re verified', icon: '✓', done: true },
];

const FRAME_DURATION = 1500; // 1.5s per frame

export default function ProfileScrapingLoader({
  handle,
  platform,
  onComplete,
  onError,
  endpoint = '/api/pr-crm/creator/scrape', // Default endpoint, can be overridden for onboarding
  frames = FRAMES,
  doneLabel = 'Profile verified',
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [completedFrames, setCompletedFrames] = useState([]);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [error, setError] = useState(null);
  const [scrapeStarted, setScrapeStarted] = useState(false);
  const stepFrames = frames?.length ? frames : FRAMES;

  // Start frame animation and scrape simultaneously
  useEffect(() => {
    if (!handle || !platform || scrapeStarted) return;
    setScrapeStarted(true);

    // Start frame animation
    const frameInterval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        if (next < stepFrames.length) {
          setCompletedFrames((framesDone) => [...framesDone, prev]);
          return next;
        }
        return prev;
      });
    }, FRAME_DURATION);

    // Start scrape API call
    const runScrape = async () => {
      try {
        const response = await apiClient.post(endpoint, {
          handle: handle.replace('@', ''),
          platform,
        });

        if (response.data.success) {
          setScrapeResult(response.data);

          // Wait for last frame to complete before calling onComplete
          const framesRemaining = stepFrames.length - currentFrame - 1;
          const waitTime = Math.max(framesRemaining * FRAME_DURATION, 500);

          setTimeout(() => {
            // Complete all remaining frames
            setCompletedFrames(stepFrames.map((_, i) => i));
            setCurrentFrame(stepFrames.length - 1);

            // Brief beat so the verified summary is readable before handoff
            setTimeout(() => {
              if (onComplete) {
                onComplete(response.data);
              }
            }, 900);
          }, waitTime);
        } else if (response.data.background) {
          // Background processing - complete frames and notify
          setCompletedFrames(stepFrames.map((_, i) => i));
          setCurrentFrame(stepFrames.length - 1);
          if (onComplete) {
            onComplete({ background: true });
          }
        } else {
          throw new Error(response.data.error || 'Scrape failed');
        }
      } catch (err) {
        console.error('Scrape error:', err);

        // Check for private profile error
        const isPrivate = err.response?.data?.is_private;
        const errorMsg = err.response?.data?.error || err.message || 'Failed to analyze profile';

        if (isPrivate) {
          setError('Your profile is private. Please make it public and try again.');
        } else {
          setError(errorMsg);
        }

        if (onError) {
          onError(err);
        }
      }
    };

    runScrape();

    return () => {
      clearInterval(frameInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, platform, scrapeStarted]);

  const isDone = scrapeResult && completedFrames.includes(stepFrames.length - 1);

  return (
    <Container>
      <ProgressRing $done={isDone}>
        {isDone ? '✓' : null}
      </ProgressRing>

      <StatusText $done={isDone}>
        {isDone ? doneLabel : stepFrames[currentFrame]?.text}
      </StatusText>

      <FrameList>
        {stepFrames.map((frame, index) => (
          <FrameItem
            key={frame.id || index}
            $active={currentFrame === index && !error}
            $done={completedFrames.includes(index)}
          >
            <FrameIcon>
              {completedFrames.includes(index) ? '✓' : frame.icon}
            </FrameIcon>
            {frame.text}
          </FrameItem>
        ))}
      </FrameList>

      {error && (
        <ErrorCard>
          {error}
        </ErrorCard>
      )}

      {(scrapeResult?.summary || scrapeResult?.scrape) && (
        <SummaryCard>
          <SummaryHeader>
            <span>✓</span> Verified @{handle.replace('@', '')}
          </SummaryHeader>
          <SummaryStats>
            {(scrapeResult.summary?.follower_display ||
              scrapeResult.scrape?.follower_count != null) && (
              <StatItem>
                <strong>
                  {scrapeResult.summary?.follower_display ||
                    scrapeResult.scrape?.follower_count}
                </strong>{' '}
                followers
              </StatItem>
            )}
            {(scrapeResult.summary?.post_count != null ||
              scrapeResult.scrape?.post_count != null ||
              scrapeResult.scrape?.recent_posts?.length > 0) && (
              <StatItem>
                <strong>
                  {scrapeResult.summary?.post_count ??
                    scrapeResult.scrape?.post_count ??
                    scrapeResult.scrape?.recent_posts?.length}
                </strong>{' '}
                posts
              </StatItem>
            )}
            {(scrapeResult.summary?.niche || scrapeResult.scrape?.primary_niche) && (
              <StatItem>
                <strong>
                  {scrapeResult.summary?.niche || scrapeResult.scrape?.primary_niche}
                </strong>
              </StatItem>
            )}
            {scrapeResult.summary?.latest_post_days_ago <= 7 && (
              <StatItem>
                Active
              </StatItem>
            )}
            {scrapeResult.summary?.aesthetic_descriptors?.length > 0 && (
              <StatItem>
                {scrapeResult.summary.aesthetic_descriptors[0]}
              </StatItem>
            )}
          </SummaryStats>
        </SummaryCard>
      )}
    </Container>
  );
}
