import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import api from '../config/api';

// Admin credentials
const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

// Color palette
const colors = {
  rose: '#E11D48',
  black: '#0F0F0F',
  violet: '#7C3AED',
  green: '#059669',
  amber: '#D97706',
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  border: '#E8E8E8',
  text: '#0F0F0F',
  text2: '#555',
  text3: '#999'
};

// Traffic source colors
const SOURCE_COLORS = {
  Organic:  colors.green,
  Direct:   colors.black,
  Social:   colors.rose,
  Referral: colors.violet,
  Email:    '#2563EB',
  Paid:     colors.amber,
  Other:    colors.text3,
};

const AdminReports = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [nudgeSent, setNudgeSent] = useState({});
  const [trafficRefreshing, setTrafficRefreshing] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [atLimitPage, setAtLimitPage] = useState(1);
  const AT_LIMIT_PER_PAGE = 10;

  // Check auth on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminReportsAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const getApiConfig = () => ({
    headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' }
  });

  const fetchDashboardData = async (bustCache = false) => {
    setLoading(true);
    try {
      // Request all at-limit users (up to 200) for proper pagination
      const params = new URLSearchParams();
      if (bustCache) params.append('bust', '1');
      params.append('at_limit_limit', '200');
      const url = `/api/admin/reports/founder-dashboard?${params.toString()}`;
      const { data: dashboardData } = await api.get(url, getApiConfig());
      setData(dashboardData);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      message.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshTraffic = async () => {
    if (trafficRefreshing) return;
    setTrafficRefreshing(true);
    try {
      const { data: dashboardData } = await api.get(
        '/api/admin/reports/founder-dashboard?bust=1',
        getApiConfig()
      );
      setData(dashboardData);
      setLastFetched(new Date());
      message.success('Traffic data refreshed');
    } catch (error) {
      message.error('Failed to refresh traffic');
    } finally {
      setTrafficRefreshing(false);
    }
  };

  // Auto-refresh every 15 minutes
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => fetchDashboardData(false), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (values) => {
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminReportsAuth', 'true');
      setIsAuthenticated(true);
      message.success('Welcome to Founder Dashboard!');
    } else {
      message.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminReportsAuth');
    setIsAuthenticated(false);
  };

  const handleSendNudge = async (user) => {
    // Mark as sending immediately for instant UI feedback
    setNudgeSent(prev => ({ ...prev, [user.creator_id]: 'sending' }));

    try {
      const response = await api.post('/api/admin/reports/send-nudge', {
        creator_id: user.creator_id,
        email: user.email
      }, getApiConfig());

      if (response.data.success) {
        setNudgeSent(prev => ({ ...prev, [user.creator_id]: 'sent' }));
        message.success(`Nudge sent to ${user.email}`);
        // Refresh data to fetch any additional at-limit users
        // This ensures the list repopulates with remaining users
        fetchDashboardData(false);
      } else if (response.data.reason === 'cooldown') {
        setNudgeSent(prev => ({ ...prev, [user.creator_id]: 'cooldown' }));
        message.warning(response.data.message || 'User was emailed recently (cron or manual)');
      } else if (response.data.reason === 'unsubscribed') {
        setNudgeSent(prev => ({ ...prev, [user.creator_id]: 'unsubscribed' }));
        message.warning('User has unsubscribed from emails');
      } else if (response.data.reason === 'smtp_not_configured') {
        setNudgeSent(prev => ({ ...prev, [user.creator_id]: 'default' }));
        message.info('Email service not configured - check SMTP env vars');
      } else {
        setNudgeSent(prev => ({ ...prev, [user.creator_id]: 'default' }));
        message.error(response.data.message || 'Failed to send nudge');
      }
    } catch (error) {
      setNudgeSent(prev => ({ ...prev, [user.creator_id]: 'default' }));
      message.error('Failed to send nudge');
    }
  };

  // Filter out users who have been successfully nudged, on cooldown, or unsubscribed
  const allAtLimitUsers = data?.at_limit_users || [];
  const visibleAtLimitUsers = allAtLimitUsers.filter(
    user => !['sent', 'cooldown', 'unsubscribed'].includes(nudgeSent[user.creator_id])
  );
  const nudgedCount = Object.values(nudgeSent).filter(s => s === 'sent').length;
  const cooldownCount = Object.values(nudgeSent).filter(s => s === 'cooldown').length;
  const totalAtLimit = data?.at_limit_count || 0;

  // Pagination for at-limit users
  const totalPages = Math.ceil(visibleAtLimitUsers.length / AT_LIMIT_PER_PAGE) || 1;
  const safePage = Math.min(atLimitPage, totalPages);
  const paginatedAtLimitUsers = visibleAtLimitUsers.slice(
    (safePage - 1) * AT_LIMIT_PER_PAGE,
    safePage * AT_LIMIT_PER_PAGE
  );

  // Reset page if it becomes invalid (e.g., after filtering out nudged users)
  useEffect(() => {
    if (atLimitPage > totalPages && totalPages > 0) {
      setAtLimitPage(totalPages);
    }
  }, [atLimitPage, totalPages]);

  // Sparkline component (for health metrics with daily objects)
  const Sparkline = ({ data, color = 'black', isToday = false }) => {
    const maxVal = Math.max(...data.map(d => d.count), 1);
    return (
      <SparkRow>
        {data.map((d, i) => (
          <SparkBar
            key={i}
            style={{ height: `${Math.max((d.count / maxVal) * 100, 10)}%` }}
            $isToday={i === data.length - 1}
            $color={color}
          />
        ))}
      </SparkRow>
    );
  };

  // Traffic sparkline (for GA4 data - simple array of numbers)
  const TrafficSparkline = ({ data = [], color = '#0F0F0F' }) => {
    const maxVal = Math.max(...data, 1);
    return (
      <SparkRow>
        {data.map((val, i) => (
          <SparkBar
            key={i}
            style={{ height: `${Math.max((val / maxVal) * 100, 10)}%`, background: i === data.length - 1 ? color : '#F0F0F0' }}
          />
        ))}
      </SparkRow>
    );
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <LoginContainer>
        <LoginCard>
          <LogoMark>N</LogoMark>
          <h2>Founder Dashboard</h2>
          <p>Enter admin credentials</p>
          <Form onFinish={handleLogin} layout="vertical">
            <Form.Item name="email" rules={[{ required: true }]}>
              <StyledInput prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true }]}>
              <StyledInput.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <LoginButton type="submit">
              Login
            </LoginButton>
          </Form>
        </LoginCard>
      </LoginContainer>
    );
  }

  if (loading || !data) {
    return (
      <LoadingContainer>
        <LogoMark>N</LogoMark>
        <p>Loading dashboard...</p>
      </LoadingContainer>
    );
  }

  const { mrr, at_limit_users, at_limit_count, near_limit_count, health, traffic, funnel, this_month } = data;

  // Calculate funnel percentages
  const calcPct = (num, denom) => denom > 0 ? Math.round((num / denom) * 100) : 0;
  const savedPct = calcPct(funnel.saved_brand, funnel.signed_up);
  const pitchPct = calcPct(funnel.sent_pitch, funnel.saved_brand);
  const multiPct = calcPct(funnel.pitched_multiple, funnel.sent_pitch);

  return (
    <>
      {/* Header */}
      <Header>
        <Logo>
          <LogoMark>N</LogoMark>
          <LogoWord>new<span>collab</span></LogoWord>
        </Logo>
        <HeaderRight>
          <Badge>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Badge>
          <RefreshBtn onClick={fetchDashboardData}>↻ Refresh</RefreshBtn>
          <RefreshBtn onClick={handleLogout}>Logout</RefreshBtn>
        </HeaderRight>
      </Header>

      <Main>
        {/* 1. THE GOAL - MRR Card */}
        <GoalCard>
          <GoalEyebrow>Your progress to ${mrr.goal.toLocaleString()} MRR</GoalEyebrow>
          <GoalRow>
            <GoalLeft>
              <GoalMRR>$<span>{mrr.current}</span></GoalMRR>
              <GoalTarget>Monthly Recurring Revenue</GoalTarget>
            </GoalLeft>
            <GoalRight>
              <GoalSubs>{mrr.total_paid}</GoalSubs>
              <GoalSubsLabel>Pro subscribers</GoalSubsLabel>
              <GoalNeeded>Need <strong>{mrr.subs_needed} more</strong> at ${mrr.pro_price}/mo</GoalNeeded>
            </GoalRight>
          </GoalRow>

          <ProgressWrap>
            <ProgressTrack>
              <ProgressFill style={{ width: `${mrr.progress_pct}%` }} />
            </ProgressTrack>
            <ProgressLabels>
              <span>$0</span>
              <span>$250</span>
              <span>$500</span>
              <span>$750</span>
              <span>$1,000</span>
            </ProgressLabels>
          </ProgressWrap>

          <MilestoneRow>
            <Milestone>
              <MilestoneLabel>Next milestone</MilestoneLabel>
              <MilestoneVal>$120 MRR</MilestoneVal>
              <MilestoneSub>10 Pro subscribers</MilestoneSub>
            </Milestone>
            <Milestone>
              <MilestoneLabel>Conversion rate</MilestoneLabel>
              <MilestoneVal>{mrr.conversion_rate}%</MilestoneVal>
              <MilestoneSub>Target: 2% industry avg</MilestoneSub>
            </Milestone>
            <Milestone>
              <MilestoneLabel>At-limit users</MilestoneLabel>
              <MilestoneVal style={{ color: '#F59E0B' }}>{at_limit_count}</MilestoneVal>
              <MilestoneSub>Hot leads this month</MilestoneSub>
            </Milestone>
          </MilestoneRow>
        </GoalCard>

        {/* 2. DO THIS TODAY */}
        <SectionLabel>Do this today — highest chance of upgrade</SectionLabel>

        <TodayCard>
          <TodayHeader>
            <TodayTitle>
              <AmberDot />
              Users who hit their pitch limit
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 12 }}>
                {totalAtLimit} total
              </span>
              {nudgedCount > 0 && (
                <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 12 }}>
                  {nudgedCount} nudged ✓
                </span>
              )}
              {cooldownCount > 0 && (
                <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 12 }}>
                  {cooldownCount} recently emailed
                </span>
              )}
            </TodayTitle>
            <TodaySubtitle>One email → could convert today · Skips users emailed in last 48h</TodaySubtitle>
          </TodayHeader>

          {visibleAtLimitUsers.length === 0 ? (
            <EmptyState>
              <strong>{nudgedCount > 0 ? 'All users nudged!' : 'No users at limit right now'}</strong>
              <p>{nudgedCount > 0
                ? `You've sent ${nudgedCount} nudge email${nudgedCount > 1 ? 's' : ''} this session.`
                : 'When free users max out their 3 weekly pitches, they\'ll appear here'}</p>
              {cooldownCount > 0 && (
                <p style={{ marginTop: 8, fontSize: 11, color: '#9CA3AF' }}>
                  {cooldownCount} user{cooldownCount > 1 ? 's' : ''} skipped — already emailed by cron job
                </p>
              )}
            </EmptyState>
          ) : (
            <>
              {paginatedAtLimitUsers.map(user => (
                <UserRow key={user.creator_id}>
                  <Avatar>{(user.username || user.email)[0].toUpperCase()}</Avatar>
                  <UserInfo>
                    <UserName>{user.username || 'Unknown'}</UserName>
                    <UserDetail>
                      {user.followers ? `${user.followers.toLocaleString()} followers · ` : ''}
                      {user.niche ? `${user.niche} · ` : ''}
                      {user.email}
                    </UserDetail>
                  </UserInfo>
                  <UserStat>
                    <UserPitches>{user.pitches_used}/3</UserPitches>
                    <UserLimit>pitches used</UserLimit>
                  </UserStat>
                  <NudgeBtn
                    $state={nudgeSent[user.creator_id] || 'default'}
                    onClick={() => nudgeSent[user.creator_id] !== 'sending' && handleSendNudge(user)}
                    disabled={nudgeSent[user.creator_id] === 'sending'}
                  >
                    {nudgeSent[user.creator_id] === 'sending' ? 'Sending...' : 'Send nudge →'}
                  </NudgeBtn>
                </UserRow>
              ))}
              {/* Pagination - show if multiple pages OR if backend has more users than loaded */}
              <PaginationRow>
                <PaginationInfo>
                  {totalPages > 1 ? (
                    <>Showing {(safePage - 1) * AT_LIMIT_PER_PAGE + 1}–{Math.min(safePage * AT_LIMIT_PER_PAGE, visibleAtLimitUsers.length)} of {visibleAtLimitUsers.length}</>
                  ) : (
                    <>Showing {visibleAtLimitUsers.length} users</>
                  )}
                  {totalAtLimit > allAtLimitUsers.length && (
                    <span style={{ marginLeft: 8, color: '#D97706' }}>
                      ({totalAtLimit - allAtLimitUsers.length} more not loaded — backend needs at_limit_limit param)
                    </span>
                  )}
                </PaginationInfo>
                {totalPages > 1 && (
                  <PaginationButtons>
                    <PaginationBtn
                      onClick={() => setAtLimitPage(p => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                    >
                      ← Prev
                    </PaginationBtn>
                    <PaginationBtn
                      onClick={() => setAtLimitPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                    >
                      Next →
                    </PaginationBtn>
                  </PaginationButtons>
                )}
              </PaginationRow>
            </>
          )}
        </TodayCard>

        {/* 3. HEALTH PULSE */}
        <SectionLabel>This week's health</SectionLabel>

        <HealthGrid>
          <HealthCard>
            <HcLabel>New signups</HcLabel>
            <HcValue $color="black">{health.signups.this_week}</HcValue>
            <HcDelta $up={health.signups.change >= 0}>
              {health.signups.change >= 0 ? '↑' : '↓'} {health.signups.change >= 0 ? '+' : ''}{health.signups.change} vs last week
            </HcDelta>
            <Sparkline data={health.signups.daily} color="black" />
          </HealthCard>

          <HealthCard>
            <HcLabel>Pitches sent</HcLabel>
            <HcValue $color="rose">{health.pitches.this_week}</HcValue>
            <HcDelta $up={health.pitches.change >= 0}>
              {health.pitches.change >= 0 ? '↑' : '↓'} {health.pitches.change >= 0 ? '+' : ''}{health.pitches.change} vs last week
            </HcDelta>
            <Sparkline data={health.pitches.daily} color="rose" />
          </HealthCard>

          <HealthCard>
            <HcLabel>Active creators</HcLabel>
            <HcValue $color="green">{health.active_creators.this_week}</HcValue>
            <HcDelta $up={health.active_creators.change >= 0}>
              {health.active_creators.change >= 0 ? '↑' : '↓'} {health.active_creators.change >= 0 ? '+' : ''}{health.active_creators.change} vs last week
            </HcDelta>
            <Sparkline data={health.active_creators.daily} color="green" />
          </HealthCard>
        </HealthGrid>

        {/* 3.5. TRAFFIC */}
        <SectionLabel style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            Traffic — last 7 days
            {traffic?.connected && <GA4Badge>● GA4 live</GA4Badge>}
            {traffic?.connected && traffic.cache_age_minutes !== undefined && (
              <span style={{ fontSize: 11, color: colors.text3, fontWeight: 400, marginLeft: 8 }}>
                updated {traffic.cache_age_minutes < 1 ? 'just now' : `${traffic.cache_age_minutes}m ago`}
              </span>
            )}
          </span>
          {traffic?.connected && (
            <RefreshBtn
              onClick={refreshTraffic}
              disabled={trafficRefreshing}
              style={{ fontSize: 12, padding: '4px 10px' }}
            >
              {trafficRefreshing ? '↻ Refreshing…' : '↻ Refresh'}
            </RefreshBtn>
          )}
        </SectionLabel>

        {!traffic || !traffic.connected ? (
          <NotConnectedBox>
            <strong>Connect GA4 to see traffic data.</strong><br />
            Add <code>GA4_PROPERTY_ID</code> and <code>GA4_SERVICE_ACCOUNT_PATH</code> to your environment variables,
            then grant the service account Viewer access in GA4 Admin → Property Access Management.
            See admintrafficdevbrief.md for full setup steps.
          </NotConnectedBox>
        ) : (
          <>
            <TrafficGrid>
              {/* Unique visitors */}
              <HealthCard>
                <HcLabel>Unique visitors</HcLabel>
                <HcValue $color="black">{traffic.visitors_this_week?.toLocaleString()}</HcValue>
                <HcDelta $up={traffic.visitors_this_week >= traffic.visitors_last_week}>
                  {traffic.visitors_this_week >= traffic.visitors_last_week ? '↑' : '↓'}{' '}
                  {Math.abs(traffic.visitors_this_week - traffic.visitors_last_week)} vs last week
                </HcDelta>
                <TrafficSparkline data={traffic.daily_visitors_7d || []} />
              </HealthCard>

              {/* Pageviews */}
              <HealthCard>
                <HcLabel>Pageviews</HcLabel>
                <HcValue $color="black">{traffic.pageviews_this_week?.toLocaleString()}</HcValue>
                <HcDelta $up={traffic.pageviews_this_week >= traffic.pageviews_last_week}>
                  {traffic.pageviews_this_week >= traffic.pageviews_last_week ? '↑' : '↓'}{' '}
                  {Math.abs(traffic.pageviews_this_week - traffic.pageviews_last_week)} vs last week
                </HcDelta>
                <TrafficSparkline data={traffic.daily_visitors_7d || []} color="#2563EB" />
              </HealthCard>

              {/* Visitor → signup rate */}
              <HealthCard>
                <HcLabel>Visitor → Signup</HcLabel>
                <HcValue $color={traffic.visitor_signup_rate >= 2 ? 'green' : 'rose'}>
                  {traffic.visitor_signup_rate}%
                </HcValue>
                <HcDelta $flat style={{ color: colors.text3 }}>
                  {traffic.signups_this_week} signups / {traffic.visitors_this_week?.toLocaleString()} visitors
                </HcDelta>
                <TrafficTip>
                  Target: 2–3%
                  {traffic.visitor_signup_rate < 2 && (
                    <span style={{ color: colors.rose, fontWeight: 700 }}> — Improve signup CTA</span>
                  )}
                </TrafficTip>
              </HealthCard>

              {/* Organic search % */}
              <HealthCard>
                <HcLabel>Organic search</HcLabel>
                <HcValue $color="green">{traffic.organic_pct}%</HcValue>
                <HcDelta $up={traffic.organic_pct >= 25}>
                  {traffic.organic_pct >= 25 ? '↑ SEO working' : 'Grow organic traffic'}
                </HcDelta>
                <TrafficTip>
                  of all traffic
                  <span style={{ color: colors.green, fontWeight: 700 }}> — Best free acquisition</span>
                </TrafficTip>
              </HealthCard>
            </TrafficGrid>

            <TrafficBottom>
              {/* Traffic sources */}
              <TrafficPanel>
                <PanelTitle>Traffic sources</PanelTitle>
                {traffic.sources?.map(s => (
                  <SourceRow key={s.label}>
                    <SourceDot $color={SOURCE_COLORS[s.label] || colors.text3} />
                    <SourceLabel>{s.label}</SourceLabel>
                    <SourceTrack>
                      <SourceFill $pct={s.pct} $color={SOURCE_COLORS[s.label] || colors.text3} />
                    </SourceTrack>
                    <SourcePct $color={SOURCE_COLORS[s.label]}>{s.pct}%</SourcePct>
                  </SourceRow>
                ))}
              </TrafficPanel>

              {/* Top pages */}
              <TrafficPanel>
                <PanelTitle>Top pages this week</PanelTitle>
                {traffic.top_pages?.map(p => (
                  <PageRow key={p.path}>
                    <PagePath>{p.path.length > 22 ? p.path.slice(0, 22) + '…' : p.path}</PagePath>
                    <span>
                      <PageViews>{p.views?.toLocaleString()}</PageViews>
                      {p.converts && <ConvertsBadge>converts</ConvertsBadge>}
                    </span>
                  </PageRow>
                ))}
              </TrafficPanel>
            </TrafficBottom>
          </>
        )}

        {/* 4. FUNNEL */}
        <SectionLabel>Where you're losing people</SectionLabel>

        <FunnelCard>
          <FunnelTitle>Creator activation funnel — all time</FunnelTitle>
          <FunnelSteps>
            <FStep>
              <FLabel>Signed up</FLabel>
              <FBarTrack>
                <FBarFill style={{ width: '100%', background: 'var(--black)' }}>
                  {funnel.signed_up} creators
                </FBarFill>
              </FBarTrack>
              <FCount>{funnel.signed_up}</FCount>
            </FStep>

            <FDrop $good={savedPct >= 50}>↓ {savedPct}% saved a brand — {savedPct >= 50 ? 'good' : 'needs work'}</FDrop>

            <FStep>
              <FLabel>Saved a brand</FLabel>
              <FBarTrack>
                <FBarFill style={{ width: `${savedPct}%`, background: '#2563EB' }}>
                  {funnel.saved_brand}
                </FBarFill>
              </FBarTrack>
              <FCount>{funnel.saved_brand}</FCount>
            </FStep>

            <FDrop $good={pitchPct >= 30}>↓ only {pitchPct}% sent a pitch — {pitchPct < 30 ? 'this is the problem' : 'decent'}</FDrop>

            <FStep>
              <FLabel>Sent pitch</FLabel>
              <FBarTrack>
                <FBarFill style={{ width: `${calcPct(funnel.sent_pitch, funnel.signed_up)}%`, background: 'var(--violet)' }}>
                  {funnel.sent_pitch}
                </FBarFill>
              </FBarTrack>
              <FCount>{funnel.sent_pitch}</FCount>
            </FStep>

            <FDrop $good={multiPct >= 50}>↓ {multiPct}% pitched more than once — {multiPct >= 50 ? 'sticky once started' : 'needs improvement'}</FDrop>

            <FStep>
              <FLabel>Pitched 2+ brands</FLabel>
              <FBarTrack>
                <FBarFill style={{ width: `${calcPct(funnel.pitched_multiple, funnel.signed_up)}%`, background: 'var(--rose)' }}>
                  {funnel.pitched_multiple}
                </FBarFill>
              </FBarTrack>
              <FCount>{funnel.pitched_multiple}</FCount>
            </FStep>

            <FDrop $good={false}>↓ {funnel.got_package > 0 ? `${funnel.got_package} confirmed` : 'no data yet — pipeline tracking will fill this'}</FDrop>

            <FStep>
              <FLabel>Got a package</FLabel>
              <FBarTrack>
                <FBarFill style={{ width: `${Math.max(calcPct(funnel.got_package, funnel.signed_up), 1)}%`, background: 'var(--green)' }}>
                  {funnel.got_package > 0 ? funnel.got_package : '??'}
                </FBarFill>
              </FBarTrack>
              <FCount style={{ color: funnel.got_package > 0 ? 'inherit' : 'var(--text-3)' }}>
                {funnel.got_package > 0 ? funnel.got_package : '??'}
              </FCount>
            </FStep>
          </FunnelSteps>

          <InsightBox>
            <strong>The one thing to fix:</strong> {funnel.saved_brand - funnel.sent_pitch} people saved a brand but never pitched. That's your biggest growth lever. The "For You" tab + follow-up nudge emails target this gap directly — watch this number improve over the next 30 days.
          </InsightBox>
        </FunnelCard>

        {/* 5. THIS MONTH */}
        <SectionLabel>This month</SectionLabel>

        <WeekGrid>
          <WeekCard>
            <WcTop>
              <WcLabel>Hot leads (at limit)</WcLabel>
              <WcDelta $up>nudge them</WcDelta>
            </WcTop>
            <WcValue style={{ color: 'var(--amber)' }}>{at_limit_count}</WcValue>
            <WcSub>Free users who maxed 3 pitches — prime upgrade moment</WcSub>
          </WeekCard>

          <WeekCard>
            <WcTop>
              <WcLabel>Almost there (2/3)</WcLabel>
              <WcDelta>watch them</WcDelta>
            </WcTop>
            <WcValue style={{ color: 'var(--black)' }}>{near_limit_count}</WcValue>
            <WcSub>One more pitch and they hit the wall — will convert next</WcSub>
          </WeekCard>

          <WeekCard>
            <WcTop>
              <WcLabel>Total pitches sent</WcLabel>
              <WcDelta $up>↑ vs last month</WcDelta>
            </WcTop>
            <WcValue>{this_month.pitches}</WcValue>
            <WcSub>Lifetime · {this_month.unique_pitch_users} unique creators used AI contact</WcSub>
          </WeekCard>

          <WeekCard>
            <WcTop>
              <WcLabel>New signups</WcLabel>
              <WcDelta $up>↑ growing</WcDelta>
            </WcTop>
            <WcValue>{this_month.signups}</WcValue>
            <WcSub>This month · {this_month.total_signups} total since launch</WcSub>
          </WeekCard>
        </WeekGrid>

      </Main>
    </>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

// Header
const Header = styled.div`
  background: #fff;
  border-bottom: 1px solid ${colors.border};
  padding: 0 28px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`;

const LogoMark = styled.div`
  width: 26px;
  height: 26px;
  background: ${colors.black};
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 900;
  font-size: 13px;
`;

const LogoWord = styled.span`
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.3px;
  span { color: ${colors.rose}; }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span`
  background: ${colors.bg};
  border: 1px solid ${colors.border};
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text2};
`;

const RefreshBtn = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: ${colors.text2};
  &:hover { background: ${colors.bg}; }
`;

// Main
const Main = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 28px 24px 80px;
  background: ${colors.bg};
  min-height: calc(100vh - 54px);

  --rose: ${colors.rose};
  --black: ${colors.black};
  --violet: ${colors.violet};
  --green: ${colors.green};
  --amber: ${colors.amber};
  --text-3: ${colors.text3};
`;

// Goal Card
const GoalCard = styled.div`
  background: ${colors.black};
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 20px;
  color: #fff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -60px;
    right: -60px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(225,29,72,.35) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const GoalEyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 10px;
`;

const GoalRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const GoalLeft = styled.div``;

const GoalMRR = styled.div`
  font-size: 52px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1;
  span { color: ${colors.rose}; }
`;

const GoalTarget = styled.div`
  font-size: 14px;
  opacity: 0.5;
  margin-top: 5px;
`;

const GoalRight = styled.div`
  text-align: right;
`;

const GoalSubs = styled.div`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

const GoalSubsLabel = styled.div`
  font-size: 12px;
  opacity: 0.5;
  margin-top: 2px;
`;

const GoalNeeded = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,.6);
  margin-top: 4px;
  strong { color: rgba(255,255,255,.9); }
`;

// Progress bar
const ProgressWrap = styled.div`
  margin-bottom: 10px;
`;

const ProgressTrack = styled.div`
  height: 10px;
  background: rgba(255,255,255,.12);
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, ${colors.rose}, #f472b6);
  transition: width 0.6s ease;
`;

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.5;
`;

// Milestones
const MilestoneRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
`;

const Milestone = styled.div`
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px;
  padding: 10px 14px;
  flex: 1;
`;

const MilestoneLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 4px;
`;

const MilestoneVal = styled.div`
  font-size: 16px;
  font-weight: 800;
`;

const MilestoneSub = styled.div`
  font-size: 11px;
  opacity: 0.5;
  margin-top: 2px;
`;

// Section Label
const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${colors.text3};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${colors.border};
  }
`;

// Today Card
const TodayCard = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
`;

const TodayHeader = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TodayTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 7px;
`;

const AmberDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${colors.amber};
  animation: ${pulse} 2s infinite;
  flex-shrink: 0;
`;

const TodaySubtitle = styled.div`
  font-size: 12px;
  color: ${colors.text3};
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #F5F5F5;
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:hover { background: #FAFAFA; }
`;

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D97706, #F59E0B);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 700;
`;

const UserDetail = styled.div`
  font-size: 11px;
  color: ${colors.text3};
  margin-top: 1px;
`;

const UserStat = styled.div`
  text-align: right;
  margin-right: 14px;
`;

const UserPitches = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${colors.amber};
`;

const UserLimit = styled.div`
  font-size: 10px;
  color: ${colors.text3};
`;

const NudgeBtn = styled.button`
  padding: 7px 14px;
  border-radius: 8px;
  background: ${props => {
    if (props.$state === 'sent') return colors.green;
    if (props.$state === 'cooldown') return colors.text3;
    return colors.amber;
  }};
  color: #fff;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: ${props => props.$state !== 'default' ? 'default' : 'pointer'};
  white-space: nowrap;
  transition: opacity 0.15s;

  &:hover { opacity: ${props => props.$state !== 'default' ? 1 : 0.85}; }
`;

const EmptyState = styled.div`
  padding: 28px 20px;
  text-align: center;
  color: ${colors.text3};
  font-size: 13px;

  strong {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: ${colors.text2};
    margin-bottom: 4px;
  }
`;

// Pagination
const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #F0F0F0;
  background: #FAFAFA;
`;

const PaginationInfo = styled.div`
  font-size: 12px;
  color: ${colors.text3};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${colors.border};
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: ${colors.text2};
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${colors.bg};
    border-color: ${colors.text3};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Health Grid
const HealthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const HealthCard = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
`;

const HcLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${colors.text3};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const HcValue = styled.div`
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -1px;
  margin-bottom: 4px;
  color: ${props => {
    switch(props.$color) {
      case 'green': return colors.green;
      case 'rose': return colors.rose;
      default: return colors.black;
    }
  }};
`;

const HcDelta = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$up ? colors.green : colors.rose};
`;

// Sparkline
const SparkRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 32px;
  margin-top: 10px;
`;

const SparkBar = styled.div`
  flex: 1;
  border-radius: 2px 2px 0 0;
  background: ${props => {
    if (!props.$isToday) return '#F0F0F0';
    switch(props.$color) {
      case 'green': return colors.green;
      case 'rose': return colors.rose;
      default: return colors.black;
    }
  }};
  min-height: 3px;
`;

// Funnel
const FunnelCard = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
`;

const FunnelTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 7px;
`;

const FunnelSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FStep = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const FLabel = styled.div`
  width: 130px;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text2};
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 90px;
    font-size: 11px;
  }
`;

const FBarTrack = styled.div`
  flex: 1;
  height: 26px;
  background: #F5F5F7;
  border-radius: 6px;
  overflow: hidden;
`;

const FBarFill = styled.div`
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
`;

const FCount = styled.div`
  width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
`;

const FDrop = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0 3px 144px;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.$good ? colors.green : colors.rose};

  @media (max-width: 640px) {
    padding-left: 104px;
  }
`;

const InsightBox = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  background: #FFF7ED;
  border: 1px solid #FDE68A;
  border-radius: 10px;
  font-size: 12.5px;
  color: #92400E;
  line-height: 1.5;

  strong { font-weight: 700; }
`;

// Week Grid
const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const WeekCard = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
`;

const WcTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
`;

const WcLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${colors.text3};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const WcValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -1px;
`;

const WcSub = styled.div`
  font-size: 11px;
  color: ${colors.text3};
`;

const WcDelta = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.$up ? colors.green : colors.text3};
`;

// Traffic Section
const TrafficGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TrafficBottom = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TrafficPanel = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
`;

const PanelTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 14px;
`;

const SourceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  &:last-child { margin-bottom: 0; }
`;

const SourceDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const SourceLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text2};
  width: 80px;
  flex-shrink: 0;
`;

const SourceTrack = styled.div`
  flex: 1;
  height: 8px;
  background: #F0F0F0;
  border-radius: 4px;
  overflow: hidden;
`;

const SourceFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background: ${props => props.$color};
  width: ${props => props.$pct}%;
  transition: width 0.6s ease;
`;

const SourcePct = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: ${props => props.$color || colors.text};
  width: 34px;
  text-align: right;
  flex-shrink: 0;
`;

const PageRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid #F5F5F5;
  &:last-child { border-bottom: none; }
`;

const PagePath = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text2};
  font-family: monospace;
`;

const PageViews = styled.span`
  font-size: 12px;
  font-weight: 800;
`;

const ConvertsBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  background: #ECFDF5;
  color: ${colors.green};
  margin-left: 6px;
`;

const GA4Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 700;
  color: #1D4ED8;
  margin-left: 8px;
  text-transform: none;
  letter-spacing: 0;
`;

const NotConnectedBox = styled.div`
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #1E3A5F;
  line-height: 1.6;

  strong { font-weight: 700; }
  code {
    background: rgba(37,99,235,.1);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
`;

const TrafficTip = styled.div`
  margin-top: 10px;
  font-size: 11px;
  color: ${colors.text3};
  line-height: 1.5;
`;

// Login
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0F0F0F 0%, #1a1a2e 100%);
`;

const LoginCard = styled.div`
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  text-align: center;
  width: 400px;

  h2 { margin: 16px 0 8px 0; }
  p { color: ${colors.text3}; margin-bottom: 24px; }
`;

const StyledInput = styled(Input)`
  height: 44px;
  border-radius: 8px;
`;

const LoginButton = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 8px;
  border: none;
  background: ${colors.black};
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.9; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${colors.bg};
  gap: 16px;

  p { color: ${colors.text3}; }
`;

export default AdminReports;
