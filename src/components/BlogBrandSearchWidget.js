'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// ─────────────────────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────────────────────

const SearchHero = styled.section`
  background: linear-gradient(135deg, #fff5f7 0%, #fef2f4 100%);
  border: 1px solid #fce4ea;
  border-radius: 20px;
  padding: 28px;
  margin: 0 0 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -40px;
    right: -40px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(232,57,95,.08) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 640px) {
    padding: 20px;
    margin: 24px 0;
  }
`;

const SearchLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #e8395f;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    background: #e8395f;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.4); }
  }
`;

const SearchTitle = styled.h2`
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
  color: #1a1a1a;

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const SearchSub = styled.p`
  font-size: 15px;
  color: #6b6f78;
  margin: 0 0 20px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  position: relative;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SearchInputWrap = styled.div`
  flex: 1;
  position: relative;
`;

const SearchIcon = styled.svg`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b6f78;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 18px 16px 46px;
  font-size: 16px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  outline: none;
  transition: border 0.15s, box-shadow 0.15s;
  font-family: inherit;
  color: #1a1a1a;

  &:focus {
    border-color: #e8395f;
    box-shadow: 0 0 0 4px rgba(232,57,95,.12);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchBtn = styled.button`
  background: #e8395f;
  color: #fff;
  border: none;
  padding: 0 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #c92549;
  }

  @media (max-width: 640px) {
    padding: 14px 24px;
    justify-content: center;
  }
`;

const SearchTrust = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 14px;
  font-size: 13px;
  color: #6b6f78;
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
    gap: 6px;

    &::before {
      content: "\\2713";
      color: #0f9d58;
      font-weight: 700;
    }
  }
`;

const Autocomplete = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(15,17,20,.08);
  z-index: 10;
  overflow: hidden;
  display: ${props => props.$open ? 'block' : 'none'};
`;

const AcItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.1s;

  &:last-child {
    border-bottom: none;
  }

  &:hover, &.active {
    background: #f7f7f8;
  }
`;

const AcLogo = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${props => props.$hasImage ? 'transparent' : '#f7f7f8'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: #3a3d45;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AcName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
`;

const AcCat = styled.div`
  font-size: 12px;
  color: #6b6f78;
  margin-left: auto;
`;

const AcNoMatch = styled.div`
  padding: 12px 16px;
  color: #6b6f78;
  font-size: 14px;
`;

// ─── RESULT CARD ───────────────────────────────────────────

const ResultCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0 40px;
  box-shadow: 0 4px 20px rgba(15,17,20,.08);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ResultHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const ResultLogo = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 20px;
  color: #1a1a1a;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ResultBrand = styled.div`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
`;

const ResultCat = styled.div`
  font-size: 14px;
  color: #6b6f78;
  margin-top: 2px;
`;

const ResultBadge = styled.div`
  margin-left: auto;
  background: #e8f7ed;
  color: #0f9d58;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
`;

const ResultDivider = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b6f78;
  margin: 8px 0 6px;
  padding-top: 12px;
  border-top: 1px dashed #e5e7eb;
`;

const ResultFacts = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    font-size: 15px;

    strong {
      font-weight: 600;
      color: #1a1a1a;
    }

    &::before {
      content: "\\2713";
      width: 22px;
      height: 22px;
      background: #e8f7ed;
      color: #0f9d58;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 12px;
      flex-shrink: 0;
    }
  }
`;

const ResultLocked = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    font-size: 15px;
    color: #9ca3af;
    opacity: 0.85;

    &::before {
      content: "\\1F512";
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      filter: grayscale(1);
    }
  }
`;

const ResultCta = styled.a`
  display: block;
  background: #e8395f;
  color: #fff;
  text-decoration: none;
  text-align: center;
  padding: 15px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  margin-top: 16px;
  transition: background 0.15s;

  &:hover {
    background: #c92549;
  }
`;

const ResultFine = styled.p`
  text-align: center;
  font-size: 13px;
  color: #6b6f78;
  margin-top: 10px;
`;

// ─── NOT FOUND CARD ────────────────────────────────────────

const NotFoundCard = styled.div`
  background: #fefaf3;
  border: 1px solid #f4e4c1;
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0 40px;
  animation: slideIn 0.3s ease-out;
`;

const NotFoundTitle = styled.h3`
  font-size: 19px;
  font-weight: 700;
  margin: 0 0 6px;

  span {
    color: #e8395f;
  }
`;

const NotFoundSub = styled.p`
  font-size: 15px;
  color: #6b6f78;
  margin: 0 0 18px;
`;

const NotifyForm = styled.form`
  display: flex;
  gap: 10px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const NotifyInput = styled.input`
  flex: 1;
  padding: 13px 16px;
  font-size: 15px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #e8395f;
    box-shadow: 0 0 0 4px rgba(232,57,95,.1);
  }
`;

const NotifyBtn = styled.button`
  background: #1a1a1a;
  color: #fff;
  border: none;
  padding: 0 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;

  &:hover {
    background: #000;
  }

  @media (max-width: 640px) {
    padding: 13px;
  }
`;

const NotifySuccess = styled.div`
  background: #e8f7ed;
  border-radius: 10px;
  padding: 14px;
  color: #0f9d58;
  font-weight: 600;
  font-size: 15px;
  text-align: center;
`;

// ─── MOBILE STICKY BAR ─────────────────────────────
const StickyMobile = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
  z-index: 40;
  display: none;

  @media (max-width: 640px) {
    display: block;
  }
`;

const StickyForm = styled.form`
  display: flex;
  gap: 8px;
  max-width: 600px;
  margin: 0 auto;
`;

const StickyInput = styled.input`
  flex: 1;
  padding: 11px 14px;
  font-size: 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  font-family: inherit;
  min-width: 0;

  &:focus {
    border-color: #e8395f;
    box-shadow: 0 0 0 3px rgba(232, 57, 95, 0.1);
  }
`;

const StickyBtn = styled.button`
  background: #e8395f;
  color: #fff;
  border: none;
  padding: 0 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #c92549;
  }
`;

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function BlogBrandSearchWidget({ postSlug }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [notFoundQuery, setNotFoundQuery] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const heroRef = useRef(null);
  const debounceRef = useRef(null);
  const [stickyQuery, setStickyQuery] = useState('');

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/blog/brand-search?q=${encodeURIComponent(q)}&mode=json&limit=5`);
      const data = await res.json();
      setSuggestions(data.brands || []);
    } catch (e) {
      console.error('Autocomplete error:', e);
      setSuggestions([]);
    }
  }, []);

  // Debounced input handler
  const handleInput = (value) => {
    setQuery(value);
    setStickyQuery(value); // Keep sticky bar in sync
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 150);

    if (value.length >= 2) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  // Select a brand from autocomplete or search
  const selectBrand = async (brand) => {
    setQuery(brand.name);
    setStickyQuery(brand.name); // Keep sticky bar in sync
    setShowAutocomplete(false);
    setSelectedBrand(brand);
    setNotFoundQuery(null);
    setActiveIndex(-1);

    // Track in dataLayer
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'blog_widget_brand_selected',
        source_page: postSlug,
        brand_slug: brand.slug,
      });
    }
  };

  // Submit search (when no autocomplete selection)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // If user has selected from autocomplete, it's already handled
    if (selectedBrand && selectedBrand.name.toLowerCase() === query.toLowerCase()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/blog/brand-search?q=${encodeURIComponent(query)}&mode=json&limit=1`);
      const data = await res.json();

      if (data.brands?.length > 0) {
        selectBrand(data.brands[0]);
      } else {
        // Not found
        setSelectedBrand(null);
        setNotFoundQuery(query);
        setNotifySuccess(false);

        // Track in dataLayer
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'blog_widget_not_found',
            source_page: postSlug,
            query_length: query.length,
          });
        }
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }

    setShowAutocomplete(false);
  };

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = (e) => {
    if (!showAutocomplete || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectBrand(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  // Handle notify me form
  const handleNotify = async (e) => {
    e.preventDefault();
    if (!notifyEmail || !notFoundQuery) return;

    try {
      await fetch('/api/blog/brand-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: notifyEmail,
          brandQuery: notFoundQuery,
          sourcePage: postSlug,
        }),
      });

      setNotifySuccess(true);

      // Track in dataLayer
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'blog_widget_notify_signup',
          source_page: postSlug,
        });
      }
    } catch (e) {
      console.error('Notify error:', e);
    }
  };

  // Close autocomplete on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track impression on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'blog_widget_impression',
        source_page: postSlug,
      });
    }
  }, [postSlug]);

  const resetView = () => {
    setQuery('');
    setSelectedBrand(null);
    setNotFoundQuery(null);
    setNotifySuccess(false);
    setSuggestions([]);
  };

  // Handle sticky search bar submit
  const handleStickySubmit = async (e) => {
    e.preventDefault();
    if (!stickyQuery.trim()) return;

    // Copy query to main input
    setQuery(stickyQuery);

    // Scroll to hero
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Run the search
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/brand-search?q=${encodeURIComponent(stickyQuery)}&mode=json&limit=1`);
      const data = await res.json();

      if (data.brands?.length > 0) {
        selectBrand(data.brands[0]);
      } else {
        setSelectedBrand(null);
        setNotFoundQuery(stickyQuery);
        setNotifySuccess(false);

        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'blog_widget_not_found',
            source_page: postSlug,
            query_length: stickyQuery.length,
            source: 'sticky_mobile',
          });
        }
      }
    } catch (e) {
      console.error('Sticky search error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SEARCH HERO */}
      <SearchHero ref={heroRef} aria-label="Search brands">
        <SearchLabel>Live brand database</SearchLabel>
        <SearchTitle>What brand are you after?</SearchTitle>
        <SearchSub>Get the verified PR contact and a personalized pitch drafted for your profile.</SearchSub>

        <SearchForm onSubmit={handleSubmit}>
          <SearchInputWrap ref={inputRef}>
            <SearchIcon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="e.g. Sephora, Glossier, Rhode..."
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => query.length >= 2 && setShowAutocomplete(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />

            <Autocomplete $open={showAutocomplete && (suggestions.length > 0 || query.length >= 2)}>
              {suggestions.length > 0 ? (
                suggestions.map((brand, idx) => (
                  <AcItem
                    key={brand.slug}
                    className={activeIndex === idx ? 'active' : ''}
                    onMouseDown={() => selectBrand(brand)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <AcLogo $hasImage={!!brand.logo}>
                      {brand.logo ? (
                        <img src={brand.logo} alt="" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = brand.logoLetter; }} />
                      ) : (
                        brand.logoLetter
                      )}
                    </AcLogo>
                    <div>
                      <AcName>{brand.name}</AcName>
                    </div>
                    <AcCat>{brand.category}</AcCat>
                  </AcItem>
                ))
              ) : (
                <AcNoMatch>No match — press "Get PR" to request "{query}"</AcNoMatch>
              )}
            </Autocomplete>
          </SearchInputWrap>

          <SearchBtn type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Get PR'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </SearchBtn>
        </SearchForm>

        <SearchTrust>
          <span>2,000+ brands</span>
          <span>Verified contacts</span>
          <span>340 followers welcome</span>
          <span>Free to start</span>
        </SearchTrust>
      </SearchHero>

      {/* RESULT CARD */}
      {selectedBrand && (
        <ResultCard>
          <ResultHead>
            <ResultLogo>
              {selectedBrand.logo ? (
                <img src={selectedBrand.logo} alt="" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = selectedBrand.logoLetter; }} />
              ) : (
                selectedBrand.logoLetter
              )}
            </ResultLogo>
            <div>
              <ResultBrand>{selectedBrand.name}</ResultBrand>
              <ResultCat>{selectedBrand.category || 'Brand'}</ResultCat>
            </div>
            <ResultBadge>In our database</ResultBadge>
          </ResultHead>

          <ResultDivider>What we know publicly</ResultDivider>
          <ResultFacts>
            {selectedBrand.minFollowers && (
              <li>Accepts creators from <strong>{selectedBrand.minFollowers}+ followers</strong></li>
            )}
            {selectedBrand.responseRate && (
              <li>Reply rate: <strong>{selectedBrand.responseRate}%</strong></li>
            )}
            {selectedBrand.collaborationType && (
              <li>Collab type: <strong>{selectedBrand.collaborationType}</strong></li>
            )}
            {selectedBrand.avgValue && (
              <li>Average PR value: <strong>${selectedBrand.avgValue}</strong></li>
            )}
            {!selectedBrand.minFollowers && !selectedBrand.responseRate && (
              <li>Brand is in our verified database</li>
            )}
          </ResultFacts>

          <ResultDivider>Unlock with free account</ResultDivider>
          <ResultLocked>
            <li>Verified PR contact (direct email)</li>
            <li>Personalized pitch drafted for your profile</li>
            <li>Follow-up coaching if they don't reply</li>
          </ResultLocked>

          <ResultCta href={`/register/creator?ref=blog_widget&brand=${selectedBrand.slug}&intent=brand_specific&source_page=${postSlug}`}>
            Unlock {selectedBrand.name} + 500 brands — Free
          </ResultCta>
          <ResultFine>No card required · 340 followers welcome · 2-minute signup</ResultFine>
        </ResultCard>
      )}

      {/* NOT FOUND CARD */}
      {notFoundQuery && !selectedBrand && (
        <NotFoundCard>
          <NotFoundTitle>We don't have "<span>{notFoundQuery}</span>" yet.</NotFoundTitle>
          <NotFoundSub>
            We add ~15 new brands every week based on what creators are searching for.
            Get notified the day {notFoundQuery} is live.
          </NotFoundSub>

          {!notifySuccess ? (
            <NotifyForm onSubmit={handleNotify}>
              <NotifyInput
                type="email"
                placeholder="your@email.com"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                required
              />
              <NotifyBtn type="submit">Notify me</NotifyBtn>
            </NotifyForm>
          ) : (
            <NotifySuccess>You're on the list. We'll email you the moment we add it.</NotifySuccess>
          )}
        </NotFoundCard>
      )}

      {/* MOBILE STICKY SEARCH BAR */}
      <StickyMobile>
        <StickyForm onSubmit={handleStickySubmit}>
          <StickyInput
            type="text"
            placeholder="Search any brand…"
            value={stickyQuery}
            onChange={(e) => setStickyQuery(e.target.value)}
            autoComplete="off"
          />
          <StickyBtn type="submit" disabled={loading}>
            {loading ? '...' : 'Search'}
          </StickyBtn>
        </StickyForm>
      </StickyMobile>
    </>
  );
}
