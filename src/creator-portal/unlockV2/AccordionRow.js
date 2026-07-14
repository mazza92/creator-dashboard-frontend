import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { TOKENS } from './copyDictionary';

/**
 * AccordionRow - Expandable row for the unlock modal
 *
 * Each row represents an achievement/status item with expandable content.
 * Row 6 (Pro) has special styling to make it stand out.
 */

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${TOKENS.accRowPadding};
  border-bottom: ${TOKENS.accRowBorder};
  position: relative;
  min-height: ${TOKENS.accRowMinHeight};
  cursor: pointer;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafbfc;
  }

  ${props => props.$isPro && `
    background: ${TOKENS.proRowBg};
    border-top: ${TOKENS.proRowBorder};
    border-bottom: ${TOKENS.proRowBorder};

    &:hover {
      background: linear-gradient(90deg, rgba(139, 92, 246, 0.08), rgba(192, 38, 211, 0.08));
    }
  `}

  ${props => props.$isExpanded && `
    background: ${TOKENS.accRowExpandedBg};
  `}
`;

const Icon = styled.div`
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;

  ${props => props.$isPro && `
    color: #8b5cf6;
  `}
`;

const LabelContainer = styled.div`
  flex: 1;
`;

const Label = styled.div`
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;

  ${props => props.$isPro && `
    color: #7c3aed;
  `}
`;

const Subline = styled.div`
  font-size: 10.5px;
  color: #8a8f98;
  font-weight: 600;
  margin-top: 2px;
`;

const StatusContainer = styled.div`
  font-size: 11.5px;
  color: #8a8f98;
  font-weight: 700;
  text-align: right;
  line-height: 1.3;
`;

const StatusPill = styled.span`
  background: ${props => {
    if (props.$type === 'pro') return TOKENS.verdictProBg;
    if (props.$type === 'pill-amber') return TOKENS.verdictAmberBg;
    return TOKENS.verdictGreenBg;
  }};
  color: ${props => {
    if (props.$type === 'pro') return '#fff';
    if (props.$type === 'pill-amber') return TOKENS.verdictAmberFg;
    return TOKENS.verdictGreenFg;
  }};
  font-size: ${props => props.$type === 'pro' ? '10px' : '9.5px'};
  font-weight: 800;
  padding: ${props => props.$type === 'pro' ? '4px 9px' : '3px 8px'};
  border-radius: 8px;
  letter-spacing: 0.03em;
`;

const Chevron = styled.div`
  color: #c4c7ce;
  font-size: 16px;
  flex-shrink: 0;
  transition: transform 0.2s;
  display: flex;
  align-items: center;

  ${props => props.$isExpanded && `
    transform: rotate(90deg);
  `}
`;

const ExpandedContent = styled(motion.div)`
  padding: 0 20px 16px 54px;
  background: ${TOKENS.accRowExpandedBg};
`;

/**
 * @param {Object} props
 * @param {string} props.icon - Emoji icon for the row
 * @param {string} props.label - Main label text
 * @param {string} [props.subline] - Optional subline text
 * @param {string} props.status - Status text or pill content
 * @param {string} props.statusType - 'text' | 'pill' | 'pill-amber' | 'pro'
 * @param {boolean} [props.isPro] - Whether this is the Pro row (special styling)
 * @param {boolean} props.isExpanded - Whether the row is expanded
 * @param {Function} props.onToggle - Toggle callback
 * @param {React.ReactNode} props.children - Expanded content
 */
const AccordionRow = ({
  icon,
  label,
  subline,
  status,
  statusType = 'text',
  isPro = false,
  isExpanded,
  onToggle,
  children
}) => {
  const rowRef = useRef(null);
  const contentRef = useRef(null);

  // Auto-scroll to show expanded content
  useEffect(() => {
    if (isExpanded) {
      // Wait for animation to complete then scroll content into view
      const timer = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
          });
        }
      }, 300); // After 200ms animation + buffer
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const renderStatus = () => {
    if (statusType === 'text') {
      return status;
    }
    return <StatusPill $type={statusType}>{status}</StatusPill>;
  };

  return (
    <>
      <Row
        ref={rowRef}
        $isPro={isPro}
        $isExpanded={isExpanded}
        onClick={onToggle}
      >
        <Icon $isPro={isPro}>{icon}</Icon>
        <LabelContainer>
          <Label $isPro={isPro}>{label}</Label>
          {subline && <Subline>{subline}</Subline>}
        </LabelContainer>
        <StatusContainer>{renderStatus()}</StatusContainer>
        <Chevron $isExpanded={isExpanded}>
          <FiChevronRight />
        </Chevron>
      </Row>

      <AnimatePresence>
        {isExpanded && children && (
          <ExpandedContent
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div ref={contentRef}>
              {children}
            </div>
          </ExpandedContent>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccordionRow;
